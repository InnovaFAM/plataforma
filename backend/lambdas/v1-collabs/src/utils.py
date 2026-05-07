import base64
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from aws_lambda_powertools.event_handler import Response, content_types

from logger import logger


def encode_key(dict_key: dict[str, Any] | None = None) -> str | None:
    if dict_key is None:
        return None
    str_key = json.dumps(dict_key)
    str_bytes = str_key.encode("utf-8")
    bytes_base64 = base64.b64encode(str_bytes)
    str_base64 = bytes_base64.decode("utf-8")
    return str_base64


def decode_key(str_base64: str, as_dict: bool = True) -> dict[str, Any] | str:
    bytes_base64 = str_base64.encode("utf-8")
    bytes_dec = base64.b64decode(bytes_base64)
    str_dec = bytes_dec.decode("utf-8").replace("'", '"')
    return json.loads(str_dec) if as_dict else str_dec


def error_response(name: str, message: str):
    error = {"error": {"name": name, "message": message}}
    logger.error(error)

    return Response(
        status_code=400,
        content_type=content_types.APPLICATION_JSON,
        body=json.dumps(error),
    )


def generate_unique_hash() -> str:
    random_bytes = secrets.token_bytes(9)

    hash_base64 = base64.b64encode(random_bytes).decode("ascii")
    clean_hash = "".join(c for c in hash_base64 if c.isalnum())[:12]
    while len(clean_hash) < 12:
        clean_hash += "A"

    return clean_hash[:12]


def is_collab_available(
    collab_startedAt: str,
    collab_endedAt: str,
    service_startedAt: str,
    service_endedAt: str,
) -> bool:
    def parse_to_aware(dt_str: str) -> datetime:
        dt = datetime.fromisoformat(dt_str)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    collab_dt_startedAt = parse_to_aware(collab_startedAt)
    collab_dt_endedAt = parse_to_aware(collab_endedAt)
    service_dt_startedAt = parse_to_aware(service_startedAt)
    service_dt_endedAt = parse_to_aware(service_endedAt)

    return (collab_dt_startedAt <= service_dt_startedAt) and (
        service_dt_endedAt <= collab_dt_endedAt
    )


def get_24_hours_from_now() -> int:
    dt = datetime.now() + timedelta(hours=1)
    return int(dt.timestamp())
