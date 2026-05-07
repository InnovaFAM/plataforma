from datetime import datetime, timezone
from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from constants import ACTIVITY_TABLE_NAME, REGION_NAME, TABLE_NAME
from models.General import PaginatedResponse
from utils import decode_key, encode_key

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)
activity_table = dynamodb.Table(ACTIVITY_TABLE_NAME)


def query_users_by_parent_id(pk: str, parent_id: str) -> list[dict[str, Any]]:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "Limit": 5,
        "FilterExpression": "parentId = :p",
        "ExpressionAttributeValues": {":p": parent_id},
        "ProjectionExpression": "sk, pictureUrl, #n",
        "ExpressionAttributeNames": {"#n": "name"},
    }

    response = table.query(**query_kwargs)
    return response.get("Items", [])


def get_all_items(pk: str, names: list[str] | None = None) -> list[dict[str, Any]]:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "ScanIndexForward": False,
    }

    if names:
        attributes_names = (
            {f"#{i}": name for i, name in enumerate(names)} if names else {}
        )
        projection_expression = ", ".join(f"#{i}" for i in range(len(names)))
        query_kwargs["ProjectionExpression"] = projection_expression
        query_kwargs["ExpressionAttributeNames"] = attributes_names

    all_items: list[dict[str, Any]] = []

    while True:
        response = table.query(**query_kwargs)
        items = response.get("Items", [])

        if not items:
            break

        all_items.extend(items)

        if "LastEvaluatedKey" in response:
            query_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]
        else:
            break

    return all_items


def get_user_notifications_items(
    pk: str,
    page_size: int = 10,
    start_key: str | None = None,
    names: list[str] | None = None,
) -> PaginatedResponse:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk)
        & Key("sk").begins_with("NOTIFICATION#"),
        "ScanIndexForward": False,
        "Limit": page_size,
    }

    if names:
        attributes_names = (
            {f"#{i}": name for i, name in enumerate(names)} if names else {}
        )
        projection_expression = ", ".join(f"#{i}" for i in range(len(names)))
        query_kwargs["ProjectionExpression"] = projection_expression
        query_kwargs["ExpressionAttributeNames"] = attributes_names

    if start_key:
        query_kwargs["ExclusiveStartKey"] = decode_key(start_key)

    response = table.query(**query_kwargs)

    next_key = response.get("LastEvaluatedKey")

    return PaginatedResponse(
        items=response.get("Items", []), last_evaluated_key=encode_key(next_key)
    )


def get_paginated_items(
    pk: str,
    page_size: int = 10,
    table_name: str = TABLE_NAME,
    start_key: str | None = None,
    names: list[str] | None = None,
) -> PaginatedResponse:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "Limit": page_size,
    }

    if names:
        attributes_names = (
            {f"#{i}": name for i, name in enumerate(names)} if names else {}
        )
        projection_expression = ", ".join(f"#{i}" for i in range(len(names)))
        query_kwargs["ProjectionExpression"] = projection_expression
        query_kwargs["ExpressionAttributeNames"] = attributes_names

    if start_key:
        query_kwargs["ExclusiveStartKey"] = decode_key(start_key)

    if table_name == TABLE_NAME:
        response = table.query(**query_kwargs)
    else:
        response = activity_table.query(**query_kwargs)

    next_key = response.get("LastEvaluatedKey")

    return PaginatedResponse(
        items=response.get("Items", []), last_evaluated_key=encode_key(next_key)
    )


def get_items_by_email(pk: str, email: str) -> list[dict[str, Any]]:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "FilterExpression": Attr("email").eq(email),
    }

    all_items: list[dict[str, Any]] = []

    while True:
        response = table.query(**query_kwargs)
        items = response.get("Items", [])

        if not items:
            break

        all_items.extend(items)

        if "LastEvaluatedKey" in response:
            query_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]
        else:
            break

    return all_items


def get_item(pk: str, sk: str) -> dict[str, Any] | None:
    response = table.get_item(Key={"pk": pk, "sk": sk})
    if item := response.get("Item", None):
        return item
    return None


def put_item(pk: str, sk: str, item: dict[str, Any]) -> dict[str, Any]:
    try:
        table.put_item(
            Item={"pk": pk, "sk": sk, **item},
            ConditionExpression=Attr("sk").not_exists(),
        )
        return item
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":  # pyright: ignore[reportTypedDictNotRequiredAccess]
            raise Exception(f"{pk} {sk} ya existe")
        else:
            raise RuntimeError(
                f"Error en put_certificate: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
            ) from e


def log_activity(user_hash: str, action: str, data_payload: Any = None):
    timestamp = datetime.now(timezone.utc).isoformat()
    category = f"ACTION#{action.upper()}"

    item = {"pk": f"USER#{user_hash}", "sk": timestamp, "category": category}

    if data_payload:
        item["data"] = data_payload
    _ = activity_table.put_item(Item=item)


def update_item(pk: str, sk: str, body_json: dict[str, Any]) -> dict[str, Any]:
    try:
        expression_attribute_values: dict[str, Any] = {}
        expression_attribute_names: dict[str, str] = {}
        update_expression: list[str] = []
        for key in body_json.keys():
            expression_attribute_values[f":{key}"] = body_json[key]
            expression_attribute_names[f"#{key}"] = key
            update_expression.append(f"#{key} = :{key}")

        response = table.update_item(
            Key={"pk": pk, "sk": sk},
            UpdateExpression=f"SET {', '.join(update_expression)}",
            ExpressionAttributeValues=expression_attribute_values,
            ConditionExpression=Attr("sk").exists(),
            ExpressionAttributeNames=expression_attribute_names,
            ReturnValues="ALL_NEW",
        )
        return response["Attributes"]
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":  # pyright: ignore[reportTypedDictNotRequiredAccess]
            raise Exception(f"{pk} - {sk} no existe")
        else:
            raise RuntimeError(f"Error en update_client: {e.response['Error']}") from e  # pyright: ignore[reportTypedDictNotRequiredAccess]
