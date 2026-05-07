from collections import defaultdict
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo


def days_from_now(end_date: str) -> int:
    timezone = ZoneInfo("America/Santiago")

    normalized_end_date = end_date.replace("Z", "+00:00")

    end_dt = datetime.fromisoformat(normalized_end_date)

    if end_dt.tzinfo is None:
        end_dt = end_dt.replace(tzinfo=timezone)
    else:
        end_dt = end_dt.astimezone(timezone)

    now = datetime.now(timezone)

    return (end_dt.date() - now.date()).days


def group_certs_by_pk(
    certs: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for cert in certs:
        grouped[cert["pk"]].append(cert)

    return dict(grouped)


def group_certs_by_pk_as_list(
    certs: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    grouped = group_certs_by_pk(certs)

    return [
        {
            "pk": pk,
            "certs": certs,
        }
        for pk, certs in grouped.items()
    ]
