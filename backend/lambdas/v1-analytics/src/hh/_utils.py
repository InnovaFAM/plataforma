from collections import defaultdict
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from utils import (
    month_range,
    overlaps_period,
    parse_iso_date_or_datetime,
    split_query_param,
)


def parse_projection_query_params(event) -> dict[str, Any]:
    params = event.query_string_parameters or {}

    horizon_raw = params.get("horizonMonths")

    try:
        horizon_months = int(horizon_raw) if horizon_raw else 12
    except ValueError:
        horizon_months = 12

    if horizon_months not in {6, 12, 18}:
        horizon_months = 12

    return {
        "month": params.get("month"),
        "horizonMonths": horizon_months,
        "statuses": split_query_param(params.get("statuses")),
        "services": split_query_param(params.get("services")),
    }


def intersect_period(
    start_a: str,
    end_a: str,
    start_b: str,
    end_b: str,
) -> tuple[date, date] | None:
    a_start = parse_iso_date_or_datetime(start_a)
    a_end = parse_iso_date_or_datetime(end_a)
    b_start = parse_iso_date_or_datetime(start_b)
    b_end = parse_iso_date_or_datetime(end_b)

    start = max(a_start, b_start)
    end = min(a_end, b_end)

    if start > end:
        return None

    return start, end


def business_days_between(start: date, end: date) -> int:
    count = 0
    current = start

    while current <= end:
        if current.weekday() < 5:  # Monday-Friday
            count += 1
        current = date.fromordinal(current.toordinal() + 1)

    return count


def calendar_days_between(start: date, end: date) -> int:
    return (end - start).days + 1


def month_key(d: date) -> str:
    return d.strftime("%Y-%m")


def calculate_person_hours_for_period_projection(
    shift_type: str | None,
    hours_per_day: float | int | None,
    period_start: str,
    period_end: str,
) -> float:
    if not shift_type or not hours_per_day:
        return 0.0

    hours_per_day = float(hours_per_day)

    period = intersect_period(period_start, period_end, period_start, period_end)
    if not period:
        return 0.0

    start, end = period
    total_days = calendar_days_between(start, end)

    shift_type_normalized = shift_type.strip().lower()

    if shift_type_normalized == "5x2":
        worked_days = business_days_between(start, end)
        return worked_days * hours_per_day

    ratio_by_shift = {
        "7x7": 7 / 14,
        "14x14": 14 / 28,
        "10x10": 10 / 20,
        "8x6": 8 / 14,
        "4x3": 4 / 7,
        "6x1": 6 / 7,
    }

    ratio = ratio_by_shift.get(shift_type_normalized)

    if ratio is None:
        # fallback conservador: días hábiles
        worked_days = business_days_between(start, end)
        return worked_days * hours_per_day

    worked_days = total_days * ratio
    return worked_days * hours_per_day


def calculate_person_hours_for_period_detail(
    shift_type: str | None,
    hours_per_day: float | int | Decimal | None,
    period_start: str,
    period_end: str,
) -> float:
    if not shift_type or hours_per_day is None:
        return 0.0

    hours_per_day = float(hours_per_day)
    start = parse_iso_date_or_datetime(period_start)
    end = parse_iso_date_or_datetime(period_end)

    total_days = calendar_days_between(start, end)
    shift_type_normalized = shift_type.strip().lower()

    if shift_type_normalized == "5x2":
        worked_days = business_days_between(start, end)
        return worked_days * hours_per_day

    ratio_by_shift = {
        "7x7": 7 / 14,
        "14x14": 14 / 28,
        "10x10": 10 / 20,
        "8x6": 8 / 14,
        "4x3": 4 / 7,
        "6x1": 6 / 7,
    }

    ratio = ratio_by_shift.get(shift_type_normalized)

    if ratio is None:
        worked_days = business_days_between(start, end)
        return worked_days * hours_per_day

    worked_days = total_days * ratio
    return worked_days * hours_per_day


def calculate_role_person_hours_in_month(role: dict[str, Any], month: str) -> float:
    month_start, month_end = month_range(month)

    if not overlaps_period(
        role.get("startedAt"),
        role.get("endedAt"),
        month_start,
        month_end,
    ):
        return 0.0

    role_start = role.get("startedAt") or "9999-12-31"
    role_end = role.get("endedAt") or "9999-12-31"
    print("AWUI", role_start, role_end)

    period = intersect_period(role_start, role_end, month_start, month_end)
    if not period:
        return 0.0

    effective_start, effective_end = period

    return calculate_person_hours_for_period_projection(
        shift_type=role.get("shiftType"),
        hours_per_day=role.get("hoursPerDay"),
        period_start=effective_start.isoformat(),
        period_end=effective_end.isoformat(),
    )
