from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import get_item, get_paginated_items, log_activity, put_item, update_item
from aws.lbda import invoke_export_services, send_notification
from logger import logger
from models.General import PatchServiceBodyRequest
from models.Service import ServicePayload
from utils import error_response

router = Router()


@router.get("/")
def get_services():
    try:
        next_key = router.current_event.get_query_string_value(
            name="nextKey", default_value=None
        )
        page_size = router.current_event.get_query_string_value(
            name="pageSize", default_value="10"
        )

        response = get_paginated_items(
            "FAM#SERVICES",
            start_key=next_key,
            page_size=int(page_size),
            names=[
                "sk",
                "code",
                "startDate",
                "endDate",
                "name",
                "parentId",
                "chore",
                "status",
                "wizardStatus",
                "managers",
            ],
        )

        client_cached = {}

        for service in response.items:
            if service["parentId"] in client_cached:
                service["client"] = {
                    "name": client_cached[service["parentId"]]["name"],
                    "hash": client_cached[service["parentId"]]["sk"],
                }
            else:
                client = get_item("FAM#CLIENTS", service["parentId"])
                service["client"] = {"name": client["name"], "hash": client["sk"]}
                client_cached[service["parentId"]] = client

        return response.model_dump_json(exclude_none=True)
    except Exception as e:
        return error_response("GetServicesError", str(e))


@router.get("/export")
def export_services():
    try:
        if user_sub := router.context.get("user_sub"):
            invoke_export_services(user_sub)
            return Response(
                status_code=202,
            )
        return error_response("ExportServicesError", "User sub not found")
    except (Exception, ValueError) as e:
        return error_response("ExportServicesError", str(e))


@router.get("/<service_code>/export")
def export_service_by_code(service_code: str):
    try:
        if user_sub := router.context.get("user_sub"):
            invoke_export_services(user_sub, service_code)
            return Response(
                status_code=202,
            )
        return error_response("ExportServiceError", "User sub not found")
    except (Exception, ValueError) as e:
        return error_response("ExportServiceError", str(e))


@router.get("/<service_code>")
def get_service_by_code(service_code: str):
    try:
        return get_item("FAM#SERVICES", f"SERVICE#{service_code}")
    except Exception as e:
        return error_response("GetServiceByCodeError", str(e))


@router.post("/")
def create_service():
    try:
        body = ServicePayload(**router.current_event.json_body)
        service = body.model_dump(exclude_none=True)
        _ = put_item("FAM#SERVICES", f"SERVICE#{body.code}", service)
        notification_type = (
            "SERVICE_CONFIRMED" if body.status == "boceto" else "SERVICE_PROPOSED"
        )
        send_notification(
            notification_type,
            {
                "serviceCode": body.name,
            },
        )
        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "CREATE_SERVICE", service)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=201, body="service created successfully")
    except Exception as e:
        return error_response("PostServiceError", str(e))


@router.patch("/")
def update_service():
    try:
        body = PatchServiceBodyRequest(**router.current_event.json_body)
        service = update_item(
            "FAM#SERVICES", body.sk, body.model_dump(exclude_none=True, exclude={"sk"})
        )

        if body.status:
            notification_type = (
                "SERVICE_CONFIRMED" if body.status == "boceto" else "SERVICE_PROPOSED"
            )
            send_notification(
                notification_type,
                {
                    "serviceCode": service.get("name", "Servicio FAM"),
                },
            )
        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "UPDATE_SERVICE", service)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=200,
            body="service updated successfully",
        )
    except Exception as e:
        return error_response("PatchServiceError", str(e))
