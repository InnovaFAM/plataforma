from typing import Any

import boto3
from boto3.dynamodb.conditions import Key

from constants import ANALYTICS_TABLE_NAME, REGION_NAME, TABLE_NAME

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)
analytics_table = dynamodb.Table(ANALYTICS_TABLE_NAME)


def get_role_for_assignment(
    assignment: dict[str, Any],
    role_cache: dict[tuple[str, str], dict[str, Any] | None],
) -> dict[str, Any] | None:
    service_code = assignment.get("serviceCode")
    role_sk = assignment.get("entityId")

    if not service_code or not role_sk:
        return None

    cache_key = (service_code, role_sk)
    if cache_key in role_cache:
        return role_cache[cache_key]

    response = table.get_item(
        Key={
            "pk": f"SERVICE#{service_code}",
            "sk": role_sk,
        }
    )

    item = response.get("Item")
    role_cache[cache_key] = item
    return item


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

        response = table.query(**kwargs)
        items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return items


def query_assignments_by_service(service_code: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    last_evaluated_key = None

    while True:
        kwargs = {
            "IndexName": "ParentIndex",
            "KeyConditionExpression": Key("parentId").eq(f"SERVICE#{service_code}"),
        }

        if last_evaluated_key:
            kwargs["ExclusiveStartKey"] = last_evaluated_key

        response = table.query(**kwargs)
        items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return items


def query_assignments_for_services(service_codes: list[str]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []

    for service_code in service_codes:
        items.extend(query_assignments_by_service(service_code))

    return items


def query_services(
    statuses: list[str] | None = None,
    service_ids: list[str] | None = None,
) -> list[dict[str, Any]]:
    statuses = statuses or []
    service_ids = service_ids or []

    items: list[dict[str, Any]] = []

    if service_ids:
        for service_id in service_ids:
            response = table.query(
                KeyConditionExpression=(
                    Key("pk").eq("FAM#SERVICES") & Key("sk").eq(f"SERVICE#{service_id}")
                )
            )
            items.extend(response.get("Items", []))
    else:
        last_evaluated_key = None

        while True:
            query_kwargs = {
                "KeyConditionExpression": (
                    Key("pk").eq("FAM#SERVICES") & Key("sk").begins_with("SERVICE#")
                )
            }

            if last_evaluated_key:
                query_kwargs["ExclusiveStartKey"] = last_evaluated_key

            response = table.query(**query_kwargs)
            items.extend(response.get("Items", []))

            last_evaluated_key = response.get("LastEvaluatedKey")
            if not last_evaluated_key:
                break

    if statuses:
        items = [item for item in items if item.get("status") in statuses]

    return items


def query_roles_by_service(service_code: str) -> list[dict[str, Any]]:
    """
    Roles:
    PK = SERVICE#SV-1001
    SK begins_with ROLES#
    """

    items = []
    last_key = None

    kwargs = {
        "KeyConditionExpression": (
            Key("pk").eq(f"SERVICE#{service_code}") & Key("sk").begins_with("ROLES#")
        )
    }

    while True:
        if last_key:
            kwargs["ExclusiveStartKey"] = last_key

        result = table.query(**kwargs)
        items.extend(result.get("Items", []))

        last_key = result.get("LastEvaluatedKey")
        if not last_key:
            break

    return items


def get_roles_for_services(
    services: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    roles_by_service: dict[str, list[dict[str, Any]]] = {}

    for service in services:
        service_code = service["code"]
        roles_by_service[service_code] = query_roles_by_service(service_code)

    return roles_by_service


def get_hh_filters_summary() -> dict[str, Any]:
    response = analytics_table.get_item(
        Key={
            "pk": "HHFILTERS",
            "sk": "SUMMARY",
        }
    )
    return response.get("Item", {})


def query_hh_detail_monthly_items_for_service(
    service_code: str,
    months: list[str],
) -> list[dict[str, Any]]:
    if not months:
        return []

    start_month = months[0]
    end_month = months[-1]

    response_items: list[dict[str, Any]] = []
    last_evaluated_key = None

    while True:
        kwargs = {
            "KeyConditionExpression": (
                Key("pk").eq(f"HHDETAIL#SERVICE#{service_code}")
                & Key("sk").between(f"MONTH#{start_month}", f"MONTH#{end_month}")
            )
        }

        if last_evaluated_key:
            kwargs["ExclusiveStartKey"] = last_evaluated_key

        response = analytics_table.query(**kwargs)
        response_items.extend(response.get("Items", []))

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    valid_month_keys = {f"MONTH#{month}" for month in months}
    return [item for item in response_items if item.get("sk") in valid_month_keys]
