import boto3
from botocore.exceptions import ClientError

from constants import REGION_NAME, USER_POOL_ID
from logger import logger

cognito_client = boto3.client("cognito-idp", region_name=REGION_NAME)


def create_user(email: str, name: str) -> str:
    try:
        response = cognito_client.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "name", "Value": name},
            ],
            MessageAction="SUPPRESS",
        )
        attributes = response["User"]["Attributes"]
        return next(attr["Value"] for attr in attributes if attr["Name"] == "sub")
    except ClientError as e:
        error_code = e.response["Error"]["Code"]  # pyright: ignore[reportTypedDictNotRequiredAccess]
        if error_code == "UsernameExistsException":
            logger.error(f"El usuario {email} ya existe en el sistema.")
        raise e
