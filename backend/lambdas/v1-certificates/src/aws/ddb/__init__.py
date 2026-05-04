from datetime import datetime, timezone
from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from constants import ACTIVITY_TABLE_NAME, REGION_NAME, TABLE_NAME

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)
activity_table = dynamodb.Table(ACTIVITY_TABLE_NAME)


def get_certificates_by_matrix(
    matrix: str, names: list[str] | None = None
) -> list[dict[str, Any]]:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq("FAM#CERTS"),
        "FilterExpression": Attr("matrix").eq(matrix),
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


def log_activity(user_hash: str, action: str, data_payload: Any = None):
    timestamp = datetime.now(timezone.utc).isoformat()
    category = f"ACTION#{action.upper()}"

    item = {"pk": f"USER#{user_hash}", "sk": timestamp, "category": category}

    if data_payload:
        item["data"] = data_payload
    _ = activity_table.put_item(Item=item)


def put_item(pk: str, sk: str, item: dict[str, Any]) -> dict[str, Any]:
    try:
        _ = table.put_item(
            Item={"pk": pk, "sk": sk, **item},
            ConditionExpression=Attr("sk").not_exists(),
            ReturnValues="ALL_OLD",
        )
        return item
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":  # pyright: ignore[reportTypedDictNotRequiredAccess]
            raise Exception(f"{pk} {sk} ya existe")
        else:
            raise RuntimeError(
                f"Error en put_certificate: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
            ) from e


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


def delete_item(pk: str, sk: str):
    try:
        _ = table.delete_item(Key={"pk": pk, "sk": sk})
    except Exception as e:
        raise Exception(f"Error deleting item pk: {pk}, sk: {sk} - {e}")
