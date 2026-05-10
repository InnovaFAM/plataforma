import json

from aws_lambda_powertools.utilities.data_classes import (
    APIGatewayProxyEventV2,
    event_source,
)

from actions import absences, employees, licences, permissions, vacations
from logger import logger
from models.General import (
    AbsenceEvent,
    EmployeeEvent,
    EventType,
    LicenceEvent,
    PermissionEvent,
    VacationEvent,
)


@event_source(data_class=APIGatewayProxyEventV2)
@logger.inject_lambda_context(log_event=True)
def lambda_handler(event: APIGatewayProxyEventV2, context):
    try:
        if event.body:
            body_json = json.loads(event.body)
            event_type = str(body_json.get("data", {}).get("event_type", ""))
            match event_type:
                case EventType.VacationUpdate.value:
                    logger.info("vacation event recibido")
                    vacations(VacationEvent(**body_json.get("data", {})))
                case (
                    EventType.AbsenceCreate.value
                    | EventType.AbsenceUpdate.value
                    | EventType.AbsenceDestroy.value
                ):
                    logger.info("absence event recibido")
                    absences(event_type, AbsenceEvent(**body_json.get("data", {})))
                case (
                    EventType.PermissionCreate.value
                    | EventType.PermissionUpdate.value
                    | EventType.PermissionDestroy.value
                ):
                    logger.info("permission event recibido")
                    permissions(
                        event_type, PermissionEvent(**body_json.get("data", {}))
                    )

                case (
                    EventType.LicenceCreate.value
                    | EventType.LicenceUpdate.value
                    | EventType.LicenceDestroy.value
                ):
                    logger.info("licence event recibido")
                    licences(event_type, LicenceEvent(**body_json.get("data", {})))
                case (
                    EventType.EmployeeUpdate.value
                    | EventType.JobMovement.value
                    | EventType.JobTermination
                ):
                    employees(EmployeeEvent(**body_json.get("data", {})))
                case _:
                    pass
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": "Cargando evento desde buk",
        }
    except Exception as e:
        logger.error(f"Error en la lambda: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps({"error": {"name": "GeneralError", "message": str(e)}}),
        }
