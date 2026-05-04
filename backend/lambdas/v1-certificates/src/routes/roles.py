from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import get_all_items, get_certificates_by_matrix, log_activity, put_item
from logger import logger
from models.FAM import CertificateRolePayload
from utils import error_response

router = Router()
pk = "CERTS#ROLES"


@router.get("/")
def get_services():
    try:
        certificates = get_certificates_by_matrix("Cargo", ["sk", "name"])
        roles = get_all_items("FAM#ROLES", ["sk", "name"])
        matrix = get_all_items(pk, ["sk"])
        return {
            "certificates": certificates,
            "roles": roles,
            "matrix": matrix,
        }
    except Exception as e:
        return error_response("GetCertificatesRolesError", str(e))


@router.post("/")
def create():
    try:
        body = CertificateRolePayload(**router.current_event.json_body)
        cr = body.model_dump(exclude_none=True)
        _ = put_item(
            pk,
            f"{body.certificate}#{body.role}",
            cr,
        )
        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "CREATE_CERT_ROLE", cr)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=201,
        )
    except Exception as e:
        return error_response("PostCertificatesRolesError", str(e))
