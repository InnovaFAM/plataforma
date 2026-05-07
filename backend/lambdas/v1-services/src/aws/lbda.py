import json
from datetime import datetime
from typing import Any

import boto3

from aws.ddb import get_item
from constants import EXPORT_LAMBDA_NAME, FUNCTION_NAME

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


def invoke_export_services(user_id: str, service_code: str | None = None):
    if user_dict := get_item("FAM#USERS", f"USERS#{user_id}"):
        payload = {
            "exportType": "SERVICES",
            "requestedBy": {
                "email": user_dict["email"],
                "name": user_dict["name"],
            },
        }

        if service_code:
            payload["exportType"] = "SERVICE_DETAIL"
            payload["filters"] = {"serviceCode": service_code}

        lambda_client.invoke(
            FunctionName=EXPORT_LAMBDA_NAME,
            InvocationType="Event",
            Payload=json.dumps(payload).encode("utf-8"),
        )
    else:
        raise ValueError(f"User {user_id} not found")
