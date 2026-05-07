from typing import Any

import boto3
from boto3.dynamodb.conditions import Key
from botocore.client import ClientError

from constants import TABLE_NAME
from logger import logger

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(TABLE_NAME)


def put_item(pk: str, sk: str, item: dict[str, Any]):
    try:
        response = table.put_item(
            Item={
                "pk": pk,
                "sk": sk,
                **item,
            }
        )
        return response
    except ClientError as e:
        logger.error({"error": {"name": "PutItemError", "message": str(e)}})


def get_all_items(pk: str, names: list[str] | None = None) -> list[dict[str, Any]]:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
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


def get_users_by_role(
    pk: str, parentId: str, names: list[str] | None = None
) -> list[dict[str, Any]]:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "FilterExpression": Key("parentId").eq(parentId),
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
