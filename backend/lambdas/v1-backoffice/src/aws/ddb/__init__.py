from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from helpers.constants import REGION_NAME, TABLE_NAME
from helpers.utils import decode_key, encode_key
from models.General import PaginatedResponse

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)


def is_client_by_rut(rut: str) -> bool:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq("FAM#CLIENTS"),
        "FilterExpression": Attr("rut").eq(rut),
    }

    response = table.query(**query_kwargs)
    items = response.get("Items", [])

    return len(items) > 0


def get_paginated_items(
    pk: str,
    page_size: int = 10,
    start_key: str | None = None,
) -> PaginatedResponse:

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "Limit": page_size,
    }

    if start_key:
        query_kwargs["ExclusiveStartKey"] = decode_key(start_key)

    response = table.query(**query_kwargs)
    next_key = response.get("LastEvaluatedKey")

    return PaginatedResponse(
        items=response.get("Items", []), last_evaluated_key=encode_key(next_key)
    )


def get_item(pk: str, sk: str) -> dict[str, Any]:
    try:
        response = table.get_item(Key={"pk": pk, "sk": sk})
        return response.get("Item", {})
    except ClientError as e:
        raise RuntimeError(
            f"Error get_item: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
        ) from e


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
                f"Error en put_item: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
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
