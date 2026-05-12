from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import get_paginated_items, is_client_by_rut, put_item, update_item
from aws.logs import log_activity
from helpers.utils import error_response, generate_unique_hash
from logger import logger
from models.ddb.Client import ClientPayload
from models.General import PatchClientBodyRequest

router = Router()
pk = "FAM#CLIENTS"


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
        logger.error(f"GetClientsError: {str(e)}")
        return error_response("GetClientsError", str(e))


@router.post("/")
def post():
    try:
        body = ClientPayload(**router.current_event.json_body)
        if is_client_by_rut(body.rut):
            return error_response(
                "PostClientError", "Client with this RUT already exists"
            )
        hash = generate_unique_hash()
        client = body.model_dump(exclude_none=True)
        client["status"] = True
        _ = put_item(pk, f"CLIENTS#{hash}", client)

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "CREATE_CLIENT", client)
        except Exception as err:
            logger.warning("LogError", str(err))

        return Response(status_code=201, body="Client created successfully")
    except Exception as e:
        return error_response("PostClientError", str(e))


@router.patch("/")
def patch():
    try:
        body = PatchClientBodyRequest(**router.current_event.json_body)
        data = body.model_dump(exclude_none=True, exclude={"sk"})
        client = update_item(pk, body.sk, data)
        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "UPDATE_CLIENT", client)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=200, body="Client updated successfully")
    except Exception as e:
        return error_response("PatchClientError", str(e))
