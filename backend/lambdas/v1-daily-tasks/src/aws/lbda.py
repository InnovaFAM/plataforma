import json
from datetime import datetime
from typing import Any

import boto3

from constants import FUNCTION_NAME

lambda_client = boto3.client("lambda")


def send_notification(notification_type: str, payload: dict[str, Any]):
    lambda_client.invoke(
        FunctionName=FUNCTION_NAME,
        InvocationType="Event",
        Payload=json.dumps(
            {
                "type": notification_type,
                "createdAt": datetime.now().isoformat(),
                "payload": payload,
            }
        ).encode("utf-8"),
    )
