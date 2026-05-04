from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_HTTP

from aws.ddb import delete_item
from logger import logger
from models.General import DeleteBodyRequest
from routes.chores import router as chores_router
from routes.globals import router as globals_router
from routes.roles import router as roles_router
from utils import error_response

app = APIGatewayHttpResolver()
app.include_router(roles_router, "/certificates/roles")
app.include_router(chores_router, "/certificates/chores")
app.include_router(globals_router, "/certificates/globals")


@app.delete("/certificates")
def delete():
    try:
        body = DeleteBodyRequest(**app.current_event.json_body)
        _ = delete_item(body.pk, body.sk)
        return Response(
            status_code=200,
        )
    except Exception as e:
        return error_response("DeleteCertificateError", str(e))


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_HTTP, log_event=True)
def lambda_handler(event, context):
    authorizer = event.get("requestContext", {}).get("authorizer", {})

    jwt_claims = authorizer.get("jwt", {}).get("claims", {})
    custom_ctx = authorizer if not jwt_claims else {}

    if user_sub := (
        jwt_claims.get("sub") or custom_ctx.get("sub") or custom_ctx.get("principalId")
    ):
        app.append_context(user_sub=user_sub)
    return app.resolve(event, context)
