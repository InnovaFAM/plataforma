import base64
import json

from aws_lambda_powertools.event_handler import Response, content_types

from logger import logger


def encode_key(key: str | None = None) -> str | None:
    if key is None:
        return None
    str_bytes = key.encode("utf-8")
    bytes_base64 = base64.b64encode(str_bytes)
    str_base64 = bytes_base64.decode("utf-8")
    return str_base64


def decode_key(str_base64: str) -> str:
    bytes_base64 = str_base64.encode("utf-8")
    bytes_dec = base64.b64decode(bytes_base64)
    str_dec = bytes_dec.decode("utf-8")
    return str_dec


def error_response(name: str, message: str):
    error = {"error": {"name": name, "message": message}}
    logger.error(error)
    return Response(
        status_code=400,
        content_type=content_types.APPLICATION_JSON,
        body=json.dumps({"error": {"name": name, "message": message}}),
    )
