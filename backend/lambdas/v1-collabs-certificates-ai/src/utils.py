import base64
from datetime import datetime, timedelta

from models.FAM import Certificate, TempCollabCertificate
from models.General import Structure


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


def get_file_type(file_key: str) -> str:
    sep = file_key.split(".")
    return sep[-1]


def get_collab_id(file_key: str) -> str:
    sep = file_key.split("/")
    return sep[1]


def parse_temp_certificate_object(collab_id: str, file_key: str, result: Structure):
    return TempCollabCertificate(
        pk=f"TEMPS#{encode_key(file_key)}",
        collabId=collab_id,
        ttl=get_24_hours_from_now(),
        **result.model_dump(exclude={"collab"}, exclude_none=True),
    )


def get_24_hours_from_now() -> int:
    dt = datetime.now() + timedelta(hours=1)
    return int(dt.timestamp())


def get_types_and_codes(certificates: list[Certificate]) -> tuple[list[str], list[str]]:
    types = list(set(c.type for c in certificates))
    codes = list(set(c.code for c in certificates))
    return types, codes
