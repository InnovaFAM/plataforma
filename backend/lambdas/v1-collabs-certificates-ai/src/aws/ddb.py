import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from constants import AWS_REGION_NAME, TABLE_NAME, TEMPS_TABLE_NAME
from logger import logger
from models.FAM import Certificate, TempCollabCertificate

dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION_NAME)


def get_certificates() -> list[Certificate]:
    try:
        table = dynamodb.Table(TABLE_NAME)
        response = table.query(
            KeyConditionExpression=Key("pk").eq("FAM#CERTS"),
        )

        items = response.get("Items", [])

        return [Certificate(**item) for item in items]

    except Exception as e:
        logger.error(f"Error querying DynamoDB: {str(e)}")
        raise e


def put_temp_collab_certificate(cc: TempCollabCertificate) -> TempCollabCertificate:
    try:
        temp_table = dynamodb.Table(TEMPS_TABLE_NAME)
        _ = temp_table.put_item(
            Item=cc.model_dump(exclude_none=True),
        )
        return cc
    except ClientError as e:
        raise RuntimeError(
            f"Error en put_temp_collab_certificate: {e.response['Error']}"  # pyright: ignore[reportTypedDictNotRequiredAccess]
        ) from e
