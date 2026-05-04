from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_HTTP

from logger import logger
from routes.collabs import router as collabs_router

app = APIGatewayHttpResolver()
app.include_router(collabs_router, "/collabs")


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
