from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.logging import correlation_paths

from logger import logger
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
