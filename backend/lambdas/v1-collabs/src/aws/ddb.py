from datetime import datetime, timezone
from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from constants import ACTIVITY_TABLE_NAME, REGION_NAME, TABLE_NAME, TEMPS_TABLE_NAME
from models.FAM import CertificateRoleMatrix
from models.General import PaginatedCollabResponse
from utils import decode_key, encode_key

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)


def get_all_items_by_role(
    pk: str, search: dict[str, Any] | None = None, names: list[str] | None = None
) -> list[dict[str, Any]]:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
    }

    if search:
        attributes_search = {f"#{k}": k for k in search.keys()} if search else {}
        filter_expression = " and ".join([f"#{k} = :{k}" for k in search.keys()])
        query_kwargs["FilterExpression"] = filter_expression
        query_kwargs["ExpressionAttributeValues"] = {
            f":{k}": v for k, v in search.items()
        }
        query_kwargs["ExpressionAttributeNames"] = attributes_search

    if names:
        attributes_names = (
            {f"#{i}": name for i, name in enumerate(names)} if names else {}
        )
        projection_expression = ", ".join(f"#{i}" for i in range(len(names)))
        query_kwargs["ProjectionExpression"] = projection_expression
        query_kwargs["ExpressionAttributeNames"] = (
            {**query_kwargs["ExpressionAttributeNames"], **attributes_names}
            if query_kwargs["ExpressionAttributeNames"]
            else attributes_names
        )

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


def get_paginated_items(
    pk: str,
    page_size: int = 10,
    start_key: str | None = None,
    names: list[str] | None = None,
) -> PaginatedCollabResponse:

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

    response = table.query(**query_kwargs)
    next_key = response.get("LastEvaluatedKey")

    return PaginatedCollabResponse(
        items=response.get("Items", []), last_evaluated_key=encode_key(next_key)
    )


def get_item(pk: str, sk: str) -> dict[str, Any] | None:
    response = table.get_item(Key={"pk": pk, "sk": sk})
    return response.get("Item", None)


def log_activity(user_hash: str, action: str, data_payload: Any = None):
    activity_table = dynamodb.Table(ACTIVITY_TABLE_NAME)
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


def query_collabs(
    pk: str, begin_with: str, names: list[str] | None = None
) -> list[dict[str, Any]]:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk) & Key("sk").begins_with(begin_with),
    }

    if names:
        attributes_names = (
            {f"#{i}": name for i, name in enumerate(names)} if names else {}
        )
        projection_expression = ", ".join(f"#{i}" for i in range(len(names)))
        query_kwargs["ProjectionExpression"] = projection_expression
        query_kwargs["ExpressionAttributeNames"] = attributes_names

    response = table.query(**query_kwargs)

    return response.get("Items", [])


def delete_item(pk: str, sk: str):
    try:
        _ = table.delete_item(Key={"pk": pk, "sk": sk})
    except Exception as e:
        raise Exception(f"Error deleting item pk: {pk}, sk: {sk} - {e}")


def get_role_by_name(
    name: str,
) -> dict[str, Any] | None:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq("FAM#ROLES"),
        "FilterExpression": Key("name").eq(name),
    }

    response = table.query(**query_kwargs)
    if items := response.get("Items", []):
        return items[0]


def is_collab_certificate_exist(
    collab_id: str,
    code: str,
) -> bool:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(f"COLLABS#{collab_id}"),
        "FilterExpression": Key("code").eq(code),
    }

    response = table.query(**query_kwargs)
    return len(response.get("Items", [])) > 0


def get_matrix_certificate_by_role(
    role: str,
) -> CertificateRoleMatrix | None:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq("CERTS#ROLES"),
        "FilterExpression": Key("role").eq(role),
    }

    response = table.query(**query_kwargs)
    if items := response.get("Items", []):
        return CertificateRoleMatrix(**items[0])


def get_temp(pk: str) -> dict[str, Any] | None:
    temps_table = dynamodb.Table(TEMPS_TABLE_NAME)
    response = temps_table.get_item(Key={"pk": pk})
    return response.get("Item", None)


def put_temp(pk: str, item: dict[str, Any]) -> dict[str, Any]:
    try:
        temps_table = dynamodb.Table(TEMPS_TABLE_NAME)
        _ = temps_table.put_item(
            Item={"pk": pk, **item},
        )
        return item
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":  # pyright: ignore[reportTypedDictNotRequiredAccess]
            raise Exception(f"{pk} ya existe")
        else:
            raise RuntimeError(
                f"Error en put_temp: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
            ) from e
