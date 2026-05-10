from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

from helpers.constants import REGION_NAME, TABLE_NAME
from helpers.utils import decode_key, encode_key, encode_string_key
from models.DeleteDependencyRule import DeleteDependencyRule
from models.General import PaginatedResponse

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TABLE_NAME)


def is_client_by_rut(rut: str) -> bool:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq("FAM#CLIENTS"),
        "FilterExpression": Attr("rut").eq(rut),
        "Select": "COUNT",
    }

    response = table.query(**query_kwargs)

    return response.get("Count", 0) > 0


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


def delete_item(pk: str, sk: str):
    try:
        _ = table.delete_item(Key={"pk": pk, "sk": sk})
    except Exception as e:
        raise Exception(f"Error deleting item pk: {pk}, sk: {sk} - {e}")


def exists_item_by_condition(pk: str, search: dict[str, Any] | None = None) -> bool:
    query_kwargs: dict[str, Any] = {
        "KeyConditionExpression": Key("pk").eq(pk),
        "Select": "COUNT",
        "Limit": 1,
    }

    if search:
        attributes_search = (
            {f"#{encode_string_key(k)}": k for k in search.keys()} if search else {}
        )
        filter_expression = " and ".join(
            [
                f"#{encode_string_key(k)} = :{encode_string_key(k)}"
                for k in search.keys()
            ]
        )
        query_kwargs["FilterExpression"] = filter_expression
        query_kwargs["ExpressionAttributeValues"] = {
            f":{encode_string_key(k)}": v for k, v in search.items()
        }
        query_kwargs["ExpressionAttributeNames"] = attributes_search

    response = table.query(**query_kwargs)

    return response.get("Count", 0) > 0


def exists_item_by_index(pk: str, search: dict[str, Any] | None = None) -> bool:
    query_kwargs: dict[str, Any] = {
        "IndexName": "ParentIndex",
        "KeyConditionExpression": Key("parentId").eq(pk),
        "Select": "COUNT",
        "Limit": 1,
    }

    if search:
        attributes_search = (
            {f"#{encode_string_key(k)}": k for k in search.keys()} if search else {}
        )
        filter_expression = " and ".join(
            [f"#{encode_string_key(k)} = :{k}" for k in search.keys()]
        )
        query_kwargs["FilterExpression"] = filter_expression
        query_kwargs["ExpressionAttributeValues"] = {
            f":{k}": v for k, v in search.items()
        }
        query_kwargs["ExpressionAttributeNames"] = attributes_search

    response = table.query(**query_kwargs)

    return response.get("Count", 0) > 0


DELETE_DEPENDENCY_RULES: dict[str, DeleteDependencyRule] = {
    "CLIENTS": {
        "checker": exists_item_by_condition,
        "target": "FAM#SERVICES",
        "search_key": "client.sk",
        "value_source": "item_sk",
        "error_message": "No se puede eliminar un cliente con servicios activos",
    },
    "CHORES": {
        "checker": exists_item_by_condition,
        "target": "FAM#SERVICES",
        "search_key": "chore.sk",
        "value_source": "item_sk",
        "error_message": "No se puede eliminar una faena con servicios activos",
    },
    "DIVISIONS": {
        "checker": exists_item_by_condition,
        "target": "FAM#SERVICES",
        "search_key": "division.sk",
        "value_source": "item_sk",
        "error_message": "No se puede eliminar una división con servicios activos",
    },
    "ROLES": {
        "checker": exists_item_by_index,
        "target": "ROLES#SERVICES",
        "search_key": "sk",
        "value_source": "item_hash",
        "error_message": "No se puede eliminar un rol asociado a un servicio",
    },
    "CERTS": {
        "checker": exists_item_by_index,
        "target": "COLLABS#CERTS",
        "search_key": "sk",
        "value_source": "item_hash",
        "error_message": "No se puede eliminar un certificado asociado a colaboradores.",
    },
    "SHIFTS": {
        "checker": exists_item_by_index,
        "target": "ROLES#SERVICES",
        "search_key": "shift.sk",
        "value_source": "item_hash",
        "error_message": "No se puede eliminar un turno activo en un rol asociado a un servicio",
    },
}
