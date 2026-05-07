import json
from datetime import datetime

from aws_lambda_powertools.event_handler.api_gateway import Router

from aws.ddb import get_roles_for_services, query_services
from hh._utils import parse_projection_query_params
from hh.builds import build_hh_projection_payload
from hh.detail._utils import parse_detail_query_params
from hh.detail.builds import build_hh_detail_payload_from_analytics
from logger import logger
from utils import decimal_default, error_response

router = Router()


@router.get("/projection")
def get_hh_projection():
    try:
        params = parse_projection_query_params(router.current_event)

        selected_month = params["month"] or datetime.utcnow().strftime("%Y-%m")
        horizon_months = params["horizonMonths"]
        statuses = params["statuses"]
        service_ids = params["services"]

        all_services = query_services()
        filtered_services = query_services(
            statuses=statuses,
            service_ids=service_ids,
        )

        logger.info(
            {
                "filtered_services_count": len(filtered_services),
                "service_codes": [
                    service.get("code") for service in filtered_services[:5]
                ],
            }
        )

        roles_by_service = get_roles_for_services(filtered_services)

        logger.info(
            {
                "roles_count_by_service": {
                    service_code: len(roles)
                    for service_code, roles in roles_by_service.items()
                }
            }
        )

        payload = build_hh_projection_payload(
            all_services=all_services,
            filtered_services=filtered_services,
            roles_by_service=roles_by_service,
            selected_month=selected_month,
            horizon_months=horizon_months,
            selected_statuses=statuses,
            selected_services=service_ids,
        )

        return json.dumps(payload, default=decimal_default)

    except Exception as error:
        logger.exception("HH projection error")

        return error_response(
            "Error loading HH projection",
            str(error),
        )


@router.get("/detail")
def get_hh_detail():
    try:
        params = parse_detail_query_params(router.current_event)

        payload = build_hh_detail_payload_from_analytics(
            selected_months=params["months"],
            selected_services=params["services"],
        )

        return json.dumps(payload, default=decimal_default)

    except Exception as error:
        logger.exception("HH detail error")

        return error_response("Error loading HH detail", str(error))
