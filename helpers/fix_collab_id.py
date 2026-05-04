import json
import os
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

TABLE_NAME = os.getenv("TABLE_NAME", "CoreBusiness_stage")
JSON_FILE_PATH = os.getenv(
    "JSON_FILE_PATH",
    "/Users/patcornejo/Projects/innovafam/helpers/collab_role_service_assignments_dummy_v2.json",
)
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(TABLE_NAME)


def load_items(file_path: str) -> list[dict]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Expected a JSON array")

    return data


def update_collab_id(item: dict) -> None:
    pk = item["pk"]
    sk = item["sk"]
    collab_id = item["collabId"]

    if DRY_RUN:
        print(f"[DRY_RUN] pk={pk} sk={sk} collabId={collab_id}")
        return

    table.update_item(
        Key={
            "pk": pk,
            "sk": sk,
        },
        UpdateExpression="SET collabId = :collabId",
        ExpressionAttributeValues={
            ":collabId": collab_id,
        },
    )

    print(f"[OK] pk={pk} sk={sk} collabId={collab_id}")


def main():
    items = load_items(JSON_FILE_PATH)

    ok = 0
    errors = 0

    for item in items:
        try:
            update_collab_id(item)
            ok += 1
        except ClientError as e:
            errors += 1
            print(
                f"[ERROR] pk={item.get('pk')} sk={item.get('sk')} "
                f"message={e.response['Error']['Message']}"
            )
        except Exception as e:
            errors += 1
            print(f"[ERROR] pk={item.get('pk')} sk={item.get('sk')} message={str(e)}")

    print(f"\nDone. OK={ok} ERRORS={errors} DRY_RUN={DRY_RUN}")


if __name__ == "__main__":
    main()
