from typing import Any

import boto3

from constants import REGION_NAME, TEMPS_TABLE_NAME

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(TEMPS_TABLE_NAME)


def get_item(pk: str) -> dict[str, Any]:
    response = table.get_item(Key={"pk": pk})
    item = response.get("Item", {})
    return item
