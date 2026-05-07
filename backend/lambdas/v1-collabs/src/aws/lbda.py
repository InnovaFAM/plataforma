import json

import boto3

from aws.ddb import get_item
from constants import EXPORT_LAMBDA_NAME, FUNCTION_NAME
from logger import logger

lambda_client = boto3.client("lambda")


def invoke_sync_collabs(mode: str, collabId: str | None = None):
    payload = {
        "mode": mode,
    }

    if collabId:
        payload["collabId"] = collabId

    lambda_client.invoke(
        FunctionName=FUNCTION_NAME,
        InvocationType="Event",
        Payload=json.dumps(payload).encode("utf-8"),
    )


def invoke_export_collabs(user_id: str):
    if user_dict := get_item("FAM#USERS", f"USERS#{user_id}"):
        payload = {
            "exportType": "COLLABS",
            "requestedBy": {
                "email": user_dict["email"],
                "name": user_dict["name"],
            },
        }

        lambda_client.invoke(
            FunctionName=EXPORT_LAMBDA_NAME,
            InvocationType="Event",
            Payload=json.dumps(payload).encode("utf-8"),
        )
    else:
        raise ValueError(f"User {user_id} not found")
