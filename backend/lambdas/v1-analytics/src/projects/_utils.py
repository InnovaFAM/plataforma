from typing import Any

from utils import split_query_param


def parse_query_params(event) -> dict[str, Any]:
    params = event.query_string_parameters or {}

    return {
        "month": params.get("month"),
        "statuses": split_query_param(params.get("statuses")),
        "services": split_query_param(params.get("services")),
    }
