from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import get_paginated_items, put_item, update_item
from aws.logs import log_activity
from helpers.utils import error_response, generate_unique_hash
from logger import logger
from models.ddb.Shift import ShiftPayload
from models.General import PatchShiftBodyRequest

router = Router()
pk = "FAM#SHIFTS"


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
        return error_response("GetShiftsError", str(e))


@router.post("/")
def post():
    try:
        body = ShiftPayload(**router.current_event.json_body)
        chore = body.model_dump(exclude_none=True)
        hash = generate_unique_hash()
        _ = put_item(pk, f"SHIFTS#{hash}", chore)

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "CREATE_SHIFT", chore)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=201,
        )
    except Exception as e:
        return error_response("PostShiftError", str(e))


@router.patch("/")
def patch():
    try:
        body = PatchShiftBodyRequest(**router.current_event.json_body)
        shift = update_item(
            pk, body.sk, body.model_dump(exclude_none=True, exclude={"sk"})
        )

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "UPDATE_SHIFT", shift)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=200,
        )
    except Exception as e:
        return error_response("PatchShiftError", str(e))
