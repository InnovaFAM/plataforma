import json
from datetime import datetime

from aws_lambda_powertools.event_handler.api_gateway import Router

from aws import query_services
from logger import logger
from projects._utils import parse_query_params
from projects.builds import build_dashboard_payload
from projects.threads import get_roles_for_services
from utils import decimal_default, error_response

router = Router()


@router.get("/")
def get_projects():
    try:
        params = parse_query_params(router.current_event)

        selected_month = params["month"] or datetime.utcnow().strftime("%Y-%m")
        statuses = params["statuses"]
        service_ids = params["services"]

        all_services = query_services()
        filtered_services = query_services(
            statuses=statuses,
            service_ids=service_ids,
        )

        roles_by_service = get_roles_for_services(filtered_services)

        payload = build_dashboard_payload(
            all_services=all_services,
            services=filtered_services,
            roles_by_service=roles_by_service,
            selected_month=selected_month,
            projection_months=6,
            selected_statuses=statuses,
            selected_services=service_ids,
        )

        return json.dumps(payload, default=decimal_default)

    except Exception as error:
        logger.exception("Dashboard error")

        return error_response(
            str(error),
            "Error loading dashboard",
        )
