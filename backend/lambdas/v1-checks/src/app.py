from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_HTTP

from aws.ddb import get_item
from logger import logger
from utils import error_response

app = APIGatewayHttpResolver()


@app.get("/checks/certificates/<hash>")
def check_certificate(hash: str):
    try:
        response = get_item(f"TEMPS#{hash}")
        if response:
            return {"found": True, "data": response}
        return {"found": False}
    except Exception as e:
        return error_response("CheckCertificateError", str(e))


@app.get("/checks/services/<hash>")
def check_services(hash: str):
    try:
        response = get_item(f"TEMPS#{hash}")
        if response:
            return {"found": True, "data": response}
        return {"found": False}
    except Exception as e:
        return error_response("CheckServiceError", str(e))


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_HTTP, log_event=True)
def lambda_handler(event, context):
    return app.resolve(event, context)
