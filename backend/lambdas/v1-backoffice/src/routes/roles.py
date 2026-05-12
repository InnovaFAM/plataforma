from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import get_paginated_items, put_item, update_item
from aws.logs import log_activity
from helpers.utils import error_response, generate_unique_hash
from logger import logger
from models.ddb.Role import RolePayload
from models.General import PatchRoleBodyRequest

router = Router()
pk = "FAM#ROLES"


@router.get("/")
def get():
    try:
        next_key = router.current_event.get_query_string_value(
            name="nextKey", default_value=None
        )
        page_size = router.current_event.get_query_string_value(
            name="pageSize", default_value="10"
        )

        response = get_paginated_items(pk, start_key=next_key, page_size=int(page_size))

        return response.model_dump_json(exclude_none=True)
    except Exception as e:
        return error_response("GetRolesError", str(e))


@router.post("/")
def post():
    try:
        body = RolePayload(**router.current_event.json_body)
        role = body.model_dump(exclude_none=True)
        hash = generate_unique_hash()
        _ = put_item(pk, f"ROLES#{hash}", role)

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "CREATE_ROLE", role)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=201, body="Role created successfully")
    except Exception as e:
        return error_response("PostRoleError", str(e))


@router.patch("/")
def patch():
    try:
        body = PatchRoleBodyRequest(**router.current_event.json_body)
        role = update_item(
            pk, body.sk, body.model_dump(exclude_none=True, exclude={"sk"})
        )

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "UPDATE_ROLE", role)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=200, body="Role updated successfully")
    except Exception as e:
        return error_response("PatchCertificateError", str(e))
