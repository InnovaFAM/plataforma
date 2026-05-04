from datetime import date, datetime
from typing import Any

from utils import split_query_param


def parse_detail_query_params(event) -> dict[str, Any]:
    params = event.query_string_parameters or {}

    months = sort_months(split_query_param(params.get("months")))
    services = split_query_param(params.get("services"))

    return {
        "months": months,
        "services": services,
    }


def sort_months(months: list[str]) -> list[str]:
    return sorted({month for month in months if month})
