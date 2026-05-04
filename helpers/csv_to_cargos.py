import csv

import boto3

from utils import generate_unique_hash

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table("CoreBusiness_stage")


def read_csv(file_path: str):
    with open(file_path, "r") as f:
        reader = csv.DictReader(f, delimiter=";")
        rows = list(reader)
    return rows


def write_to_dynamodb(rows):
    for row in rows:
        hash = generate_unique_hash()
        item = {
            "pk": "FAM#ROLES",
            "sk": f"ROLES#{hash}",
            "status": True,
            **row,
        }
        table.put_item(Item=item)


if __name__ == "__main__":
    rows = read_csv("fam_cargos.csv")
    write_to_dynamodb(rows)
