from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import get_paginated_items, put_item, update_item
from aws.logs import log_activity
from helpers.utils import error_response, generate_unique_hash
from logger import logger
from models.ddb.Holiday import HolidayPayload
from models.General import PatchHolidayBodyRequest

router = Router()
pk = "FAM#HOLIDAYS"


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
        return error_response("GetHolidaysError", str(e))


@router.post("/")
def post():
    try:
        body = HolidayPayload(**router.current_event.json_body)
        holiday = body.model_dump(exclude_none=True)
        hash = generate_unique_hash()
        _ = put_item(pk, f"HOLIDAYS#{hash}", holiday)

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "CREATE_HOLIDAY", holiday)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=201, body="Holiday created successfully")
    except Exception as e:
        return error_response("PostHolidayError", str(e))


@router.patch("/")
def patch():
    try:
        body = PatchHolidayBodyRequest(**router.current_event.json_body)
        holiday = update_item(
            pk, body.sk, body.model_dump(exclude_none=True, exclude={"sk"})
        )

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "UPDATE_HOLIDAY", holiday)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=200, body="Holiday updated successfully")
    except Exception as e:
        return error_response("PatchHolidayError", str(e))
