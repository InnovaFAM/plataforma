from typing import Optional

import boto3
from botocore.exceptions import ClientError, BotoCoreError

from constants import ENV
from logger import logger
from models import APIToken

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(f'api-tokens-{ENV}')


def get(pk: str) -> Optional[APIToken]:
    try:
        response = table.get_item(
            Key={
                'pk': pk,
            }
        )
        item = response.get("Item")
        return APIToken(**item) if item is not None else None
    except (BotoCoreError, ClientError) as error:
        logger.error(f"error getting agent: {error}")
    return None