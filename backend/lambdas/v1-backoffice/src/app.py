from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.logging import correlation_paths

from aws.ddb import (
    DELETE_DEPENDENCY_RULES,
    delete_item,
    get_item,
)
from helpers.utils import error_response
from logger import logger
from models.General import DeleteItemBodyRequest
from routes.certificates import router as certificates_router
from routes.chores import router as chores_router
from routes.clients import router as clients_router
from routes.divisions import router as divisions_router
from routes.holidays import router as holidays_router
from routes.roles import router as roles_router
from routes.shifts import router as shifts_router

app = APIGatewayHttpResolver()
app.include_router(clients_router, "/backoffice/clients")
app.include_router(certificates_router, "/backoffice/certificates")
app.include_router(roles_router, "/backoffice/roles")
app.include_router(chores_router, "/backoffice/chores")
app.include_router(divisions_router, "/backoffice/divisions")
app.include_router(holidays_router, "/backoffice/holidays")
app.include_router(shifts_router, "/backoffice/shifts")


@app.delete("/backoffice")
def delete_backoffice_item():
    try:
        body = DeleteItemBodyRequest(**app.current_event.json_body)
        pk = f"FAM#{body.itemType.upper()}"
        if item := get_item(pk, body.itemHash):
            rule = DELETE_DEPENDENCY_RULES.get(body.itemType)

            if rule is None:
                return error_response(
                    "DeleteItemError",
                    f"Item {body.itemType} no se puede eliminar. Contacte a su administrador.",
                )

            search_value = (
                item["sk"] if rule["value_source"] == "item_sk" else body.itemHash
            )

            has_dependencies = rule["checker"](
                rule["target"],
                search={rule["search_key"]: search_value},
            )

            if has_dependencies:
                return error_response(
                    "DeleteItemError",
                    rule["error_message"],
                )
            _ = delete_item(pk, body.itemHash)
        else:
            return error_response("DeleteItemError", f"Item {body.itemName} not found")
        return Response(status_code=202, body="Item deleted successfully")
    except Exception as e:
        return error_response("DeleteItemError", str(e))


@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.API_GATEWAY_HTTP, log_event=True
)
def lambda_handler(event, context):
    authorizer = event.get("requestContext", {}).get("authorizer", {})

    jwt_claims = authorizer.get("jwt", {}).get("claims", {})
    custom_ctx = authorizer if not jwt_claims else {}

    if user_sub := (
        jwt_claims.get("sub") or custom_ctx.get("sub") or custom_ctx.get("principalId")
    ):
        app.append_context(user_sub=user_sub)
    return app.resolve(event, context)
