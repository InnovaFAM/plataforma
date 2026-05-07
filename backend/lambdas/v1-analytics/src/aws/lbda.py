import json
from typing import Any

import boto3

from aws.ddb import get_item
from constants import EXPORT_LAMBDA_NAME

lambda_client = boto3.client("lambda")


def invoke_export_projects(user_id: str, payload: dict[str, Any]):
    if user_dict := get_item("FAM#USERS", f"USERS#{user_id}"):
        payload = {
            "exportType": "PROJECTS_PANEL",
            "requestedBy": {
                "email": user_dict["email"],
                "name": user_dict["name"],
            },
            "data": {
                "kpis": payload["kpis"],
                "charts": payload["charts"],
                "rolesTable": payload["rolesTable"],
            },
        }

        lambda_client.invoke(
            FunctionName=EXPORT_LAMBDA_NAME,
            InvocationType="Event",
            Payload=json.dumps(payload).encode("utf-8"),
        )
    else:
        raise ValueError(f"User {user_id} not found")
