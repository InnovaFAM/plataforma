from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from constants import TABLE_NAME

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def get_services_ending_in_x_days(days: int) -> list[dict[str, Any]]:
    target_date = (
        (datetime.now(ZoneInfo("America/Santiago")) + timedelta(days=days))
        .date()
        .isoformat()
    )

    services: list[dict[str, Any]] = []

    query_params = {
        "KeyConditionExpression": Key("pk").eq("FAM#SERVICES"),
        "FilterExpression": Attr("endDate").begins_with(target_date),
        "ProjectionExpression": "pk, sk, endDate, #n",
        "ExpressionAttributeNames": {"#n": "name"},
    }

    while True:
        response = table.query(**query_params)

        services.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

        query_params["ExclusiveStartKey"] = last_evaluated_key

    return services


def get_services_ended_less_than_5_days_ago() -> list[dict[str, Any]]:
    timezone = ZoneInfo("America/Santiago")

    now = datetime.now(timezone)
    five_days_ago = now - timedelta(days=5)

    start_date = five_days_ago.isoformat()
    end_date = now.isoformat()

    services: list[dict[str, Any]] = []

    query_params = {
        "KeyConditionExpression": Key("pk").eq("FAM#SERVICES"),
        "FilterExpression": Attr("endDate").between(start_date, end_date),
        "ProjectionExpression": "pk, sk, endDate, #n",
        "ExpressionAttributeNames": {"#n": "name"},
    }

    while True:
        response = table.query(**query_params)

        services.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

        query_params["ExclusiveStartKey"] = last_evaluated_key

    return services


def get_all_expired_collab_certs() -> list[dict[str, Any]]:
    timezone = ZoneInfo("America/Santiago")

    now = datetime.now(timezone)
    collab_certs: list[dict[str, Any]] = []

    query_params = {
        "IndexName": "ParentIndex",
        "KeyConditionExpression": Key("parentId").eq("COLLABS#CERTS"),
        "FilterExpression": Attr("expiredAt").lt(now.isoformat()),
        "ProjectionExpression": "pk, sk, endDate, #n",
        "ExpressionAttributeNames": {"#n": "name"},
    }

    while True:
        response = table.query(**query_params)

        collab_certs.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

        query_params["ExclusiveStartKey"] = last_evaluated_key

    return collab_certs


def get_item(pk: str, sk: str) -> dict[str, Any]:
    try:
        response = table.get_item(Key={"pk": pk, "sk": sk})
        return response.get("Item", {})
    except ClientError as e:
        raise RuntimeError(
            f"Error get_item: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
        ) from e
