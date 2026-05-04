from jwt import ExpiredSignatureError, InvalidIssuerError, InvalidTokenError

from logger import logger
from src.token import extract_bearer_token, verify_cognito_access_token


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    try:
        token = extract_bearer_token(event)
        claims = verify_cognito_access_token(token)

        return {
            "isAuthorized": True,
            "context": {
                "sub": claims["sub"],
                "username": claims.get("username", ""),
                "scope": claims.get("scope", ""),
                "groups": ",".join(claims.get("cognito:groups", [])),
                "token_use": claims.get("token_use", ""),
            },
        }

    except (
        ExpiredSignatureError,
        InvalidIssuerError,
        InvalidTokenError,
        ValueError,
    ) as err:
        logger.error(err)
        return {
            "isAuthorized": False,
            "context": {
                "auth_error": "invalid_or_expired_token",
            },
        }
