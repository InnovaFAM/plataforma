from typing_extensions import Any

from aws import (
    query_assignments_by_service,
    query_roles_by_service,
    query_timeoffs_for_collab,
)
from builds import (
    build_detail_items_for_service,
    build_projection_items_for_service,
)
from logger import logger
from utils import overlaps_period


def process_service(
    service: dict[str, Any],
    rebuild_start: str,
    rebuild_end: str,
) -> dict[str, Any]:
    service_code = service["code"]

    logger.info(
        {
            "action": "process_service_start",
            "serviceCode": service_code,
            "rebuildStart": rebuild_start,
            "rebuildEnd": rebuild_end,
        }
    )

    service_start = service.get("startDate")
    service_end = service.get("endDate")

    effective_start = (
        max(rebuild_start, service_start) if service_start else rebuild_start
    )
    effective_end = min(rebuild_end, service_end) if service_end else rebuild_end

    if effective_start > effective_end:
        return {
            "serviceCode": service_code,
            "projectionItems": [],
            "detailItems": [],
        }

    roles = query_roles_by_service(service_code)
    assignments = query_assignments_by_service(service_code)

    assignments = [
        item
        for item in assignments
        if overlaps_period(
            item.get("startedAt"),
            item.get("endedAt"),
            effective_start,
            effective_end,
        )
    ]

    collab_ids = sorted(
        {item["collabId"] for item in assignments if item.get("collabId")}
    )

    collab_timeoffs: dict[str, list[dict[str, Any]]] = {}
    for collab_id in collab_ids:
        collab_timeoffs[collab_id] = query_timeoffs_for_collab(collab_id)

    projection_items = build_projection_items_for_service(
        service=service,
        roles=roles,
        start_date=effective_start,
        end_date=effective_end,
    )

    detail_items = build_detail_items_for_service(
        service=service,
        roles=roles,
        assignments=assignments,
        collab_timeoffs=collab_timeoffs,
        start_date=effective_start,
        end_date=effective_end,
    )

    logger.info(
        {
            "action": "process_service_done",
            "serviceCode": service_code,
            "projectionCount": len(projection_items),
            "detailCount": len(detail_items),
        }
    )

    return {
        "serviceCode": service_code,
        "projectionItems": projection_items,
        "detailItems": detail_items,
    }
