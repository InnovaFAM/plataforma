import json
from typing import Any

import boto3
from tqdm import tqdm

from utils import convert_floats_to_decimal

TABLE_NAME = "CoreBusiness_prod"

FILE = "/Users/patcornejo/Projects/innovafam/helpers/shifts_fam_dynamodb_with_data.json"
with open(FILE) as f:
    file = json.load(f)
    data = file

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def batch_insert(items: list[dict[str, Any]]):
    with table.batch_writer(overwrite_by_pkeys=["pk", "sk"]) as batch:
        for entry in tqdm(items):
            batch.put_item(Item=convert_floats_to_decimal(entry))


if __name__ == "__main__":
    batch_insert(data)
    print("Carga completada")
