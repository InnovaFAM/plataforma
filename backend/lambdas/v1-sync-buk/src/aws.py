from typing import Any

import boto3
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

from constants import TABLE_NAME
from logger import logger

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(TABLE_NAME)


def put_item(item: dict[str, Any]):
    try:
        response = table.put_item(Item=item)
        return response
    except ClientError as e:
        logger.error({"error": {"name": "PutItemError", "message": str(e)}})


def batch_write(items: list[dict[str, Any]]):
    try:
        with table.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)
        logger.info(f"Se insertaron {len(items)} ítems exitosamente.")
        return True

    except ClientError as e:
        logger.error({"error": {"name": "BatchWriteError", "message": str(e)}})


def get_item(pk: str, sk: str) -> dict[str, Any]:
    try:
        response = table.get_item(Key={"pk": pk, "sk": sk})
        return response.get("Item", {})
    except ClientError as e:
        raise RuntimeError(
            f"Error get_item: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
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
            raise RuntimeError(f"Error en update_item: {e.response['Error']}") from e  # pyright: ignore[reportTypedDictNotRequiredAccess]
