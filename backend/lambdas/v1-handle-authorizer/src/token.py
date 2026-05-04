import jwt
from jwt import InvalidTokenError, PyJWKClient

from src.constants import COGNITO_APP_CLIENT_ID, ISSUER, JWKS_URL

jwk_client = PyJWKClient(
    JWKS_URL,
    cache_jwk_set=True,
    cache_keys=True,
    lifespan=300,
)


def extract_bearer_token(event: dict) -> str:
    headers = event.get("headers") or {}
    auth_header = headers.get("authorization") or headers.get("Authorization")
    if not auth_header:
        raise ValueError("Missing Authorization header")

    if not auth_header.startswith("Bearer "):
        raise ValueError("Invalid Authorization header format")

    return auth_header.split(" ", 1)[1].strip()


def verify_cognito_access_token(token: str) -> dict:
    signing_key = jwk_client.get_signing_key_from_jwt(token)

    claims = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        issuer=ISSUER,
        options={
            "require": ["exp", "iss", "sub", "token_use"],
            "verify_aud": False,  # access token de Cognito usa client_id, no aud
        },
    )

    if claims.get("token_use") != "access":
        raise InvalidTokenError("token_use must be 'access'")

    if claims.get("client_id") != COGNITO_APP_CLIENT_ID:
        raise InvalidTokenError("Invalid client_id")

    return claims
