import base64
import secrets
from decimal import Decimal


def generate_unique_hash() -> str:
    random_bytes = secrets.token_bytes(9)

    hash_base64 = base64.b64encode(random_bytes).decode("ascii")
    clean_hash = "".join(c for c in hash_base64 if c.isalnum())[:12]
    while len(clean_hash) < 12:
        clean_hash += "A"

    return clean_hash[:12]


def convert_floats_to_decimal(value):
    if isinstance(value, float):
        return Decimal(str(value))

    if isinstance(value, dict):
        return {k: convert_floats_to_decimal(v) for k, v in value.items()}

    if isinstance(value, list):
        return [convert_floats_to_decimal(item) for item in value]

    return value
