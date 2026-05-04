import base64
from datetime import datetime, timedelta


def get_file_type(file_key: str) -> str:
    sep = file_key.split(".")
    return sep[-1]


def encode_key(key: str | None = None) -> str | None:
    if key is None:
        return None
    str_bytes = key.encode("utf-8")
    bytes_base64 = base64.b64encode(str_bytes)
    str_base64 = bytes_base64.decode("utf-8")
    return str_base64


def get_24_hours_from_now() -> int:
    dt = datetime.now() + timedelta(hours=1)
    return int(dt.timestamp())
