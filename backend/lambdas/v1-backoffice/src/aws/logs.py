from datetime import datetime, timezone
from typing import Any

import boto3

from helpers.constants import ACTIVITY_TABLE_NAME, REGION_NAME

dynamodb = boto3.resource("dynamodb", region_name=REGION_NAME)
table = dynamodb.Table(ACTIVITY_TABLE_NAME)


def log_activity(user_hash: str, action: str, data_payload: Any = None):
    timestamp = datetime.now(timezone.utc).isoformat()
    category = f"ACTION#{action.upper()}"

    item = {"pk": f"USER#{user_hash}", "sk": timestamp, "category": category}

    if data_payload:
        item["data"] = data_payload
    _ = table.put_item(Item=item)
