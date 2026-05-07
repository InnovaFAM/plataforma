from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key

from constants import REGION_NAME, TABLE_NAME
from utils import unwrap_dynamodb_value

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)


def get_all_items(
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


def fetch_service_detail(service_code: str) -> dict[str, Any]:
    table = dynamodb.Table(TABLE_NAME)

    service_sk = f"SERVICE#{service_code}"
    role_pk = f"SERVICE#{service_code}"

    service_response = table.get_item(
        Key={
            "pk": "FAM#SERVICES",
            "sk": service_sk,
        }
    )

    service = service_response.get("Item")

    if not service:
        raise ValueError(f"Service not found: {service_code}")

    roles = fetch_service_roles(service_code=service_code)

    assignments_by_role: dict[str, list[dict[str, Any]]] = {}
    all_assignments: list[dict[str, Any]] = []

    for role in roles:
        role_sk = role.get("sk")

        if not role_sk:
            continue

        role_assignments = fetch_role_assignments(
            service_code=service_code,
            role_sk=role_sk,
        )

        assignments_by_role[role_sk] = role_assignments
        all_assignments.extend(role_assignments)

    return {
        "service": unwrap_dynamodb_value(service),
        "roles": [unwrap_dynamodb_value(role) for role in roles],
        "assignmentsByRole": {
            role_sk: [unwrap_dynamodb_value(item) for item in items]
            for role_sk, items in assignments_by_role.items()
        },
        "assignments": [unwrap_dynamodb_value(item) for item in all_assignments],
    }


def fetch_service_roles(service_code: str) -> list[dict[str, Any]]:
    table = dynamodb.Table(TABLE_NAME)

    role_pk = f"SERVICE#{service_code}"

    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": (
            Key("pk").eq(role_pk) & Key("sk").begins_with("ROLES#")
        ),
    }

    items: list[dict[str, Any]] = []

    while True:
        response = table.query(**query_kwargs)
        items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

        query_kwargs["ExclusiveStartKey"] = last_evaluated_key

    return items


def fetch_role_assignments(
    service_code: str,
    role_sk: str,
) -> list[dict[str, Any]]:
    table = dynamodb.Table(TABLE_NAME)

    parent_id = f"SERVICE#{service_code}"

    query_kwargs: dict[str, Any] = {
        "IndexName": "ParentIndex",
        "KeyConditionExpression": (
            Key("parentId").eq(parent_id) & Key("entityId").eq(role_sk)
        ),
    }

    items: list[dict[str, Any]] = []

    while True:
        response = table.query(**query_kwargs)
        items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

        query_kwargs["ExclusiveStartKey"] = last_evaluated_key

    return items
