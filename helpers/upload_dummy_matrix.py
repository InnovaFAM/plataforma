import json
from datetime import datetime

import boto3
from tqdm import tqdm

TABLE_NAME = "CoreBusiness_stage"
PK_VALUE = "CERTS#ROLES"

# Tu array (puedes cargarlo desde archivo JSON también)
with open("matrix_roles.json") as f:
    file = json.load(f)
    matrix = file["matrix"]

# Cliente DynamoDB
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def build_item(entry: dict) -> dict:
    cert_code, role_hash = entry["sk"].split("#", 1)

    return {
        "pk": PK_VALUE,
        "sk": entry["sk"],
        "assignedAt": datetime.now().isoformat(),
        "assignedBy": "Patricio Cornejo",
        "certificate": cert_code,
        "role": role_hash,
    }


def batch_insert(items: list):
    with table.batch_writer(overwrite_by_pkeys=["pk", "sk"]) as batch:
        for entry in tqdm(items):
            item = build_item(entry)
            batch.put_item(Item=item)


if __name__ == "__main__":
    batch_insert(matrix)
    print("Carga completada")
