from datetime import datetime, timezone
from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from constants import ACTIVITY_TABLE_NAME, REGION_NAME, TABLE_NAME
from models.General import PaginatedServiceResponse
from models.Role import Role
from utils import decode_key, encode_key

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)
activity_table = dynamodb.Table(ACTIVITY_TABLE_NAME)


def count_collabs_assigned_to_role(parentId: str) -> int:

    query_kwargs: dict[str, Any] = {
        "IndexName": "ParentIndex",
        "KeyConditionExpression": Key("parentId").eq(parentId),
        "Select": "COUNT",
    }

    total_count: int = 0

    while True:
        response = table.query(**query_kwargs)
        total_count += response.get("Count", 0)

        if "LastEvaluatedKey" in response:
            query_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]
        else:
            break

    return total_count


def find_items_affected_by_parent_date_change(
    parentId: str, new_startedAt: str, new_endedAt: str
) -> list[dict[str, Any]]:
    """
    Encuentra items cuyo rango de fechas se superpone con el nuevo rango del padre.

    Se superponen si: item.startedAt <= new_endedAt AND item.endedAt >= new_startedAt
    """

    response = table.query(
        IndexName="ParentIndex",
        KeyConditionExpression=Key("parentId").eq(parentId),
    )

    affected_items: list[dict[str, Any]] = []
    for item in response.get("Items", []):
        startedAt = item.get("startedAt")
        endedAt = item.get("endedAt")

        if not startedAt or not endedAt:
            continue

        if not isinstance(startedAt, str):
            continue

        if not isinstance(endedAt, str):
            continue

        if startedAt <= new_endedAt and endedAt >= new_startedAt:
            affected_items.append(item)

    return affected_items


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


def get_paginated_items(
    pk: str,
    page_size: int = 10,
    start_key: str | None = None,
    names: list[str] | None = None,
) -> PaginatedServiceResponse:

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

    return PaginatedServiceResponse(
        items=response.get("Items", []), last_evaluated_key=encode_key(next_key)
    )


def has_role_in_service(pk: str, roleName: str) -> bool:
    try:
        response = table.query(
            KeyConditionExpression=Key("pk").eq(pk),
            FilterExpression=Key("roleName").eq(roleName),
            ProjectionExpression="pk, roleName",
            Limit=1,  # Solo obtiene 1 item y se detiene
        )
        return len(response.get("Items", [])) > 0
    except Exception:
        return False


def get_item(pk: str, sk: str) -> dict[str, Any]:
    response = table.get_item(Key={"pk": pk, "sk": sk})
    return response.get("Item", {})


def put_item(pk: str, sk: str, item: dict[str, Any]) -> dict[str, Any]:
    try:
        _ = table.put_item(
            Item={"pk": pk, "sk": sk, **item},
            ConditionExpression=Attr("sk").not_exists(),
        )
        return item
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":  # pyright: ignore[reportTypedDictNotRequiredAccess]
            raise Exception(f"{pk} {sk} ya existe")
        else:
            raise RuntimeError(
                f"Error put_item: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
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


def add_assignment_to_collab(collab_id: str, assignment: dict[str, Any]):
    try:
        _ = table.update_item(
            Key={"pk": "FAM#COLLABS", "sk": f"COLLABS#{collab_id}"},
            UpdateExpression="SET #attr = list_append(if_not_exists(#attr, :empty), :a)",
            ExpressionAttributeNames={"#attr": "assignments"},
            ExpressionAttributeValues={":a": [assignment], ":empty": []},
        )
    except Exception as e:
        raise Exception(f"Error adding assignment to collab - {collab_id} - {e}")


def remove_assignment_to_collab(collab_id: str):
    try:
        _ = table.update_item(
            Key={"pk": "FAM#COLLABS", "sk": f"COLLABS#{collab_id}"},
            UpdateExpression="REMOVE assignments",
        )
    except Exception as e:
        raise Exception(f"Error removing assignment from collab - {collab_id} - {e}")


def delete_item(pk: str, sk: str):
    try:
        _ = table.delete_item(Key={"pk": pk, "sk": sk})
    except Exception as e:
        raise Exception(f"Error deleting item pk: {pk}, sk: {sk} - {e}")


def log_activity(user_hash: str, action: str, data_payload: Any = None):
    timestamp = datetime.now(timezone.utc).isoformat()
    category = f"ACTION#{action.upper()}"

    item = {"pk": f"USER#{user_hash}", "sk": timestamp, "category": category}

    if data_payload:
        item["data"] = data_payload
    _ = activity_table.put_item(Item=item)
