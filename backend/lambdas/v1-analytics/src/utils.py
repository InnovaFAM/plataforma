import json
from datetime import date
from decimal import Decimal
from time import perf_counter
from typing import Any

from aws_lambda_powertools.event_handler import Response, content_types

from logger import logger


def overlaps_period(
    started_at: str | None, ended_at: str | None, period_start: str, period_end: str
) -> bool:
    if not started_at:
        return False

    role_start = started_at
    role_end = ended_at or "9999-12-31"

    return role_start <= period_end and role_end >= period_start


def add_months(month: str, offset: int) -> str:
    year, month_num = map(int, month.split("-"))

    month_num += offset

    while month_num > 12:
        month_num -= 12
        year += 1

    while month_num < 1:
        month_num += 12
        year -= 1

    return f"{year}-{month_num:02d}"


def month_range(month: str) -> tuple[str, str]:
    """
    month: 2026-04
    returns: 2026-04-01, 2026-04-30
    """
    year, month_num = map(int, month.split("-"))

    start = date(year, month_num, 1)

    if month_num == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month_num + 1, 1)

    end = date.fromordinal(next_month.toordinal() - 1)

    return start.isoformat(), end.isoformat()


def split_query_param(value: str | None) -> list[str]:
    if not value:
        return []

    return [item.strip() for item in value.split(",") if item.strip()]


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


def error_response(name: str, message: str):
    error = {"error": {"name": name, "message": message}}
    logger.error(error)

    return Response(
        status_code=400,
        content_type=content_types.APPLICATION_JSON,
        body=json.dumps(error),
    )


def timed(label: str, fn, *args, **kwargs):
    start = perf_counter()
    result = fn(*args, **kwargs)
    elapsed_ms = round((perf_counter() - start) * 1000, 2)

    logger.info(
        {
            "timing": label,
            "elapsedMs": elapsed_ms,
        }
    )

    return result
