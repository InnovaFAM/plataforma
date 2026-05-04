import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

from aws_lambda_powertools.logging import correlation_paths

from aws import query_services, write_items_batch
from builds import build_filter_summary_item
from constants import MAX_WORKERS
from logger import logger
from utils import decimal_default, service_overlaps_range
from workers import process_service


@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.EVENT_BRIDGE, log_event=True
)
def lambda_handler(event, context):
    try:
        """
        Ejemplos de event:

        { "mode": "full" }

        {
          "mode": "incremental",
          "serviceCodes": ["SV-1001", "SV-1002"],
          "startDate": "2026-08-01",
          "endDate": "2026-09-30"
        }
        """

        mode = event.get("mode", "full")
        all_services = query_services()

        if mode == "full":
            services_to_process, rebuild_start, rebuild_end = (
                resolve_services_for_full_rebuild(all_services)
            )
        elif mode == "incremental":
            service_codes = event.get("serviceCodes", [])
            start_date = event.get("startDate")
            end_date = event.get("endDate")

            if not service_codes or not start_date or not end_date:
                raise ValueError(
                    "Incremental mode requires serviceCodes, startDate and endDate"
                )

            services_to_process, rebuild_start, rebuild_end = (
                resolve_services_for_incremental(
                    all_services,
                    service_codes,
                    start_date,
                    end_date,
                )
            )
        else:
            raise ValueError(f"Unsupported mode: {mode}")

        logger.info(
            {
                "action": "rebuild_start",
                "mode": mode,
                "servicesCount": len(services_to_process),
                "rebuildStart": rebuild_start,
                "rebuildEnd": rebuild_end,
                "maxWorkers": MAX_WORKERS,
            }
        )

        all_projection_items: list[dict[str, Any]] = []
        all_detail_items: list[dict[str, Any]] = []

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = [
                executor.submit(process_service, service, rebuild_start, rebuild_end)
                for service in services_to_process
            ]

            for future in as_completed(futures):
                result = future.result()
                all_projection_items.extend(result["projectionItems"])
                all_detail_items.extend(result["detailItems"])

        # Metadata filtros
        filter_summary_item = build_filter_summary_item(all_services)

        logger.info(
            {
                "action": "write_items_start",
                "projectionItems": len(all_projection_items),
                "detailItems": len(all_detail_items),
            }
        )

        write_items_batch(all_projection_items)
        write_items_batch(all_detail_items)
        write_items_batch([filter_summary_item])

        logger.info(
            {
                "action": "rebuild_done",
                "mode": mode,
                "projectionItems": len(all_projection_items),
                "detailItems": len(all_detail_items),
            }
        )

        return (
            json.dumps(
                {
                    "mode": mode,
                    "servicesProcessed": len(services_to_process),
                    "projectionItems": len(all_projection_items),
                    "detailItems": len(all_detail_items),
                    "filtersWritten": True,
                },
                default=decimal_default,
            ),
        )
    except Exception as e:
        logger.exception(e)
        raise


def resolve_services_for_full_rebuild(
    services: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], str, str]:
    valid_services = [
        s for s in services if s.get("code") and s.get("startDate") and s.get("endDate")
    ]

    if not valid_services:
        raise ValueError("No valid services found for full rebuild")

    global_start = min(service["startDate"] for service in valid_services)
    global_end = max(service["endDate"] for service in valid_services)

    return valid_services, global_start, global_end


def resolve_services_for_incremental(
    services: list[dict[str, Any]],
    service_codes: list[str],
    start_date: str,
    end_date: str,
) -> tuple[list[dict[str, Any]], str, str]:
    filtered = [
        service
        for service in services
        if service.get("code") in service_codes
        and service_overlaps_range(service, start_date, end_date)
    ]

    return filtered, start_date, end_date
