import json

from aws_lambda_powertools.event_handler.api_gateway import Router

from aws.ddb import (
    count_items_by_pk,
    get_services_for_home,
)
from logger import logger
from utils import decimal_default, error_response

router = Router()


@router.get("/")
def get_home():
    try:
        count_services = count_items_by_pk("FAM#SERVICES")
        count_collabs = count_items_by_pk("FAM#COLLABS")
        count_notifications = 0

        services = get_services_for_home()

        payload = {
            "resume": {
                "count_services": count_services,
                "count_collabs": count_collabs,
                "count_notifications": count_notifications,
            },
            "services": services,
            "notifications": [],
        }

        return json.dumps(payload, default=decimal_default)

    except Exception as error:
        logger.exception("HH projection error")

        return error_response(
            "Error loading HH projection",
            str(error),
        )
