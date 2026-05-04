from typing import Any

import boto3
from botocore.exceptions import ClientError

from constants import TABLE_NAME
from logger import logger

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
tabla = dynamodb.Table(TABLE_NAME)


def put_item(item: dict[str, Any]):
    try:
        response = tabla.put_item(Item=item)
        return response
    except ClientError as e:
        logger.error({"error": {"name": "PutItemError", "message": str(e)}})


def batch_write(items: list[dict[str, Any]]):
    try:
        with tabla.batch_writer() as batch:
            for item in items:
                batch.put_item(Item=item)
        logger.info(f"Se insertaron {len(items)} ítems exitosamente.")
        return True

    except ClientError as e:
        logger.error({"error": {"name": "BatchWriteError", "message": str(e)}})
