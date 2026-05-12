import json
from datetime import datetime
from typing import Any

import boto3

from constants import NOTIFICATION_FUNCTION_NAME

lambda_client = boto3.client("lambda")


def send_notification(payload: dict[str, Any]):
    _ = lambda_client.invoke(
        FunctionName=NOTIFICATION_FUNCTION_NAME,
        InvocationType="Event",
        Payload=json.dumps(
            {
                "type": "NEW_USER_CREATED",
                "createdAt": datetime.now().isoformat(),
                "payload": {"platformName": "SIGES InnovaFAM", **payload},
            }
        ).encode("utf-8"),
    )
