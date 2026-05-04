from typing import Any

import boto3
from boto3.dynamodb.conditions import Key

from constants import ANALYTICS_TABLE_NAME, CORE_TABLE_NAME
from utils import chunked, to_ddb_attr

dynamodb_resource = boto3.resource("dynamodb")
core_table = dynamodb_resource.Table(CORE_TABLE_NAME)

dynamodb_client = boto3.client("dynamodb")


def query_services() -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    last_evaluated_key = None

    while True:
        kwargs = {
            "KeyConditionExpression": (
                Key("pk").eq("FAM#SERVICES") & Key("sk").begins_with("SERVICE#")
            )
        }

        if last_evaluated_key:
            kwargs["ExclusiveStartKey"] = last_evaluated_key

        response = core_table.query(**kwargs)
        items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return items


def query_assignments_by_service(service_code: str) -> list[dict[str, Any]]:
    """
    Requiere GSI sobre parentId.
    parentId = SERVICE#<serviceCode>
    """
    items: list[dict[str, Any]] = []
    last_evaluated_key = None

    while True:
        kwargs = {
            "IndexName": "ParentIndex",
            "KeyConditionExpression": Key("parentId").eq(f"SERVICE#{service_code}"),
        }

        if last_evaluated_key:
            kwargs["ExclusiveStartKey"] = last_evaluated_key

        response = core_table.query(**kwargs)
        batch = response.get("Items", [])

        batch = [
            item
            for item in batch
            if str(item.get("pk", "")).startswith("COLLABS#")
            and str(item.get("sk", "")).startswith("SERVICE#")
            and "#ROLES#" in str(item.get("sk", ""))
        ]

        items.extend(batch)

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return items


def query_roles_by_service(service_code: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    last_evaluated_key = None

    while True:
        kwargs = {
            "KeyConditionExpression": (
                Key("pk").eq(f"SERVICE#{service_code}")
                & Key("sk").begins_with("ROLES#")
            )
        }

        if last_evaluated_key:
            kwargs["ExclusiveStartKey"] = last_evaluated_key

        response = core_table.query(**kwargs)
        items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return items


def query_timeoffs_for_collab(collab_id: str) -> list[dict[str, Any]]:
    pk = f"COLLABS#{collab_id}"
    items: list[dict[str, Any]] = []
    last_evaluated_key = None

    while True:
        kwargs = {
            "KeyConditionExpression": (
                Key("pk").eq(pk) & Key("sk").begins_with("TIMEOFF#")
            )
        }

        if last_evaluated_key:
            kwargs["ExclusiveStartKey"] = last_evaluated_key

        response = core_table.query(**kwargs)
        items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return items


def write_items_batch(items: list[dict[str, Any]]) -> None:
    if not items:
        return

    request_items = []
    for item in items:
        request_items.append(
            {"PutRequest": {"Item": {k: to_ddb_attr(v) for k, v in item.items()}}}
        )

    for chunk in chunked(request_items, 25):
        payload = {ANALYTICS_TABLE_NAME: chunk}

        while True:
            response = dynamodb_client.batch_write_item(RequestItems=payload)
            unprocessed = response.get("UnprocessedItems", {})
            if not unprocessed or not unprocessed.get(ANALYTICS_TABLE_NAME):
                break

            payload = unprocessed
