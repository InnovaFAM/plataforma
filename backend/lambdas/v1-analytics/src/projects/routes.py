import json
from datetime import datetime

from aws_lambda_powertools.event_handler import Response
from aws_lambda_powertools.event_handler.api_gateway import Router

from aws.lbda import invoke_export_projects
from logger import logger
from projects._utils import parse_query_params
from projects.payload import get_payload
from utils import decimal_default, error_response

router = Router()


@router.get("/")
def get_projects():
    try:
        params = parse_query_params(router.current_event)

        selected_month = params["month"] or datetime.utcnow().strftime("%Y-%m")
        statuses = params["statuses"]
        service_ids = params["services"]

        payload = get_payload(selected_month, statuses, service_ids)
        return json.dumps(payload, default=decimal_default)
    except Exception as error:
        logger.exception("Dashboard error")

        return error_response(
            str(error),
            "Error loading dashboard",
        )


@router.get("/export")
def export_projects():
    try:
        params = parse_query_params(router.current_event)
        if user_sub := router.context.get("user_sub"):
            selected_month = params["month"] or datetime.utcnow().strftime("%Y-%m")
            statuses = params["statuses"]
            service_ids = params["services"]
            payload = get_payload(selected_month, statuses, service_ids)
            invoke_export_projects(user_sub, payload)
            return Response(
                status_code=202,
            )
        return error_response("ExportServicesError", "User sub not found")
    except Exception as error:
        return error_response(
            str(error),
            "Error exporting projects",
        )
