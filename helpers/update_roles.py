import json
import os
from decimal import Decimal
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from constants import AWS_REGION, TABLE_NAME

JSON_FILE_PATH = "./roles_shift_assignment_updates.json"
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"


dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)


def decimalize(value):
    if isinstance(value, float):
        return Decimal(str(value))
    if isinstance(value, dict):
        return {k: decimalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [decimalize(v) for v in value]
    return value


def load_updates(file_path: str) -> list[dict]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {file_path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Expected a JSON array at the root of the file")

    return data


def build_update_kwargs(item: dict) -> dict:
    key = item["key"]
    update_item = item["updateItem"]

    kwargs = {
        "Key": decimalize(key),
        "UpdateExpression": update_item["UpdateExpression"],
        "ExpressionAttributeValues": decimalize(
            update_item["ExpressionAttributeValues"]
        ),
        "ReturnValues": "NONE",
    }

    if "ExpressionAttributeNames" in update_item:
        kwargs["ExpressionAttributeNames"] = update_item["ExpressionAttributeNames"]

    if "ConditionExpression" in update_item:
        kwargs["ConditionExpression"] = update_item["ConditionExpression"]

    return kwargs


def run_updates() -> None:
    updates = load_updates(JSON_FILE_PATH)

    success_count = 0
    error_count = 0

    for index, item in enumerate(updates, start=1):
        pk = item["key"]["pk"]
        sk = item["key"]["sk"]
        shift_type = item.get("attributes", {}).get("shiftType")
        confidence = item.get("confidence")

        try:
            kwargs = build_update_kwargs(item)

            if DRY_RUN:
                print(
                    f"[DRY_RUN] #{index} pk={pk} sk={sk} "
                    f"shiftType={shift_type} confidence={confidence}"
                )
                continue

            table.update_item(**kwargs)

            success_count += 1
            print(
                f"[OK] #{index} pk={pk} sk={sk} "
                f"shiftType={shift_type} confidence={confidence}"
            )

        except ClientError as e:
            error_count += 1
            print(
                f"[ERROR] #{index} pk={pk} sk={sk} "
                f"message={e.response['Error']['Message']}"
            )
        except Exception as e:
            error_count += 1
            print(f"[ERROR] #{index} pk={pk} sk={sk} message={str(e)}")

    if DRY_RUN:
        print(f"\nDry run completed. Items inspected: {len(updates)}")
    else:
        print(f"\nUpdate completed. Success: {success_count} | Errors: {error_count}")


if __name__ == "__main__":
    run_updates()
