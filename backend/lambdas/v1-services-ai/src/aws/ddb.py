from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from constants import AWS_REGION_NAME, TABLE_NAME, TEMPS_TABLE_NAME
from models.FAM import TempService
from utils import get_24_hours_from_now

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION_NAME)
table = dynamodb.Table(TABLE_NAME)


def get_items(
    pk: str,
) -> list[dict[str, Any]]:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "Limit": 100,
    }

    response = table.query(**query_kwargs)

    return response.get("Items", [])


def put_temp_service(ts: TempService) -> TempService:
    try:
        temp_table = dynamodb.Table(TEMPS_TABLE_NAME)
        _ = temp_table.put_item(
            Item={**ts.model_dump(exclude_none=True), "ttl": get_24_hours_from_now()},
        )
        return ts
    except ClientError as e:
        raise RuntimeError(
            f"Error en put_temp_service: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
        ) from e
