from aws_lambda_powertools.event_handler.api_gateway import Router

from aws.ddb import get_certificates_by_matrix
from utils import error_response

router = Router()


@router.get("/")
def get():
    try:
        certificates = get_certificates_by_matrix("Global", ["sk", "name"])
        return {"certificates": certificates}
    except Exception as e:
        return error_response("GetCertificatesGlobalsError", str(e))
