from collections import defaultdict
from datetime import date
from decimal import Decimal
from typing import Any


def decimal_default(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError


def chunked(items: list[dict[str, Any]], size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def intersect_period(
    start_a: str,
    end_a: str,
    start_b: str,
    end_b: str,
) -> tuple[date, date] | None:
    a_start = date.fromisoformat(start_a)
    a_end = date.fromisoformat(end_a)
    b_start = date.fromisoformat(start_b)
    b_end = date.fromisoformat(end_b)

    start = max(a_start, b_start)
    end = min(a_end, b_end)

    if start > end:
        return None

    return start, end


def month_range(month: str) -> tuple[str, str]:
    year, month_num = map(int, month.split("-"))
    start = date(year, month_num, 1)

    if month_num == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month_num + 1, 1)

    end = date.fromordinal(next_month.toordinal() - 1)
    return start.isoformat(), end.isoformat()


def months_between(start_date: str, end_date: str) -> list[str]:
    start = date.fromisoformat(start_date).replace(day=1)
    end = date.fromisoformat(end_date).replace(day=1)

    months: list[str] = []
    current = start

    while current <= end:
        months.append(current.strftime("%Y-%m"))

        if current.month == 12:
            current = date(current.year + 1, 1, 1)
        else:
            current = date(current.year, current.month + 1, 1)

    return months


def overlaps_period(
    started_at: str | None,
    ended_at: str | None,
    period_start: str,
    period_end: str,
) -> bool:
    if not started_at:
        return False

    item_start = started_at
    item_end = ended_at or "9999-12-31"

    return item_start <= period_end and item_end >= period_start


def service_overlaps_range(
    service: dict[str, Any],
    start_date: str,
    end_date: str,
) -> bool:
    return overlaps_period(
        service.get("startDate"),
        service.get("endDate"),
        start_date,
        end_date,
    )


def to_ddb_attr(value: Any) -> dict[str, Any]:
    if value is None:
        return {"NULL": True}
    if isinstance(value, bool):
        return {"BOOL": value}
    if isinstance(value, (int, float, Decimal)):
        return {"N": str(value)}
    if isinstance(value, str):
        return {"S": value}
    if isinstance(value, list):
        return {"L": [to_ddb_attr(v) for v in value]}
    if isinstance(value, dict):
        return {"M": {k: to_ddb_attr(v) for k, v in value.items()}}
    raise TypeError(f"Unsupported type for DynamoDB serialization: {type(value)}")


def calendar_days_between(start: date, end: date) -> int:
    """
    Inclusive day count
    """
    return (end - start).days + 1


def business_days_between(start: date, end: date) -> int:
    """
    Monday-Friday inclusive
    Does NOT discount holidays yet
    """
    count = 0
    current = start

    while current <= end:
        if current.weekday() < 5:
            count += 1
        current = date.fromordinal(current.toordinal() + 1)

    return count


def calculate_person_hours_for_period(
    shift_type: str | None,
    hours_per_day: float | int | Decimal | None,
    period_start: str,
    period_end: str,
) -> float:
    """
    Calculates theoretical hours contributed by ONE person in the given period.

    Rules:
    - 5x2 => business days * hours_per_day
    - 7x7 => 7/14 of calendar days * hours_per_day
    - 14x14 => 14/28 of calendar days * hours_per_day
    - 10x10 => 10/20 of calendar days * hours_per_day
    - 8x6 => 8/14 of calendar days * hours_per_day
    - 4x3 => 4/7 of calendar days * hours_per_day
    - 6x1 => 6/7 of calendar days * hours_per_day
    - fallback => business days * hours_per_day
    """
    if not shift_type or hours_per_day is None:
        return 0.0

    hours_per_day = float(hours_per_day)

    start = date.fromisoformat(period_start)
    end = date.fromisoformat(period_end)

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


def normalize_timeoff_reason(reason: str | None) -> str:
    if not reason:
        return "Sin categoría"

    reason_normalized = reason.strip().lower()

    mapping = {
        "vacaciones": "Vacaciones",
        "licencia": "Licencia médica",
        "licencia médica": "Licencia médica",
        "licencia medica": "Licencia médica",
        "permiso": "Permiso",
        "capacitación": "Capacitación",
        "capacitacion": "Capacitación",
        "ausencia": "Ausencia",
        "descanso": "Descanso",
    }

    return mapping.get(reason_normalized, reason.strip().capitalize())


def build_role_map(roles: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    """
    role_map["ROLES#hash"] = role
    """
    return {role["sk"]: role for role in roles if role.get("sk")}


def calculate_assignment_theoretical_hh(
    assignment: dict[str, Any],
    role: dict[str, Any],
    range_start: str,
    range_end: str,
) -> float:
    if not overlaps_period(
        assignment.get("startedAt"),
        assignment.get("endedAt"),
        range_start,
        range_end,
    ):
        return 0.0

    assignment_start = assignment.get("startedAt")
    assignment_end = assignment.get("endedAt") or "9999-12-31"

    overlap = intersect_period(
        assignment_start,
        assignment_end,
        range_start,
        range_end,
    )

    if not overlap:
        return 0.0

    overlap_start, overlap_end = overlap

    return calculate_person_hours_for_period(
        shift_type=role.get("shiftType"),
        hours_per_day=role.get("hoursPerDay"),
        period_start=overlap_start.isoformat(),
        period_end=overlap_end.isoformat(),
    )


def calculate_assignment_timeoff_hh_and_reasons(
    assignment: dict[str, Any],
    role: dict[str, Any],
    timeoffs: list[dict[str, Any]],
    range_start: str,
    range_end: str,
) -> tuple[float, dict[str, float]]:
    total_absence_hh = 0.0
    absence_by_reason: dict[str, float] = defaultdict(float)

    assignment_start = assignment.get("startedAt")
    assignment_end = assignment.get("endedAt") or "9999-12-31"

    assignment_vs_range = intersect_period(
        assignment_start,
        assignment_end,
        range_start,
        range_end,
    )

    if not assignment_vs_range:
        return 0.0, {}

    valid_start, valid_end = assignment_vs_range

    for timeoff in timeoffs:
        timeoff_start = timeoff.get("startDate")
        timeoff_end = timeoff.get("endDate") or timeoff_start

        if not timeoff_start:
            continue

        overlap = intersect_period(
            valid_start.isoformat(),
            valid_end.isoformat(),
            timeoff_start,
            timeoff_end,
        )

        if not overlap:
            continue

        overlap_start, overlap_end = overlap

        hh = calculate_person_hours_for_period(
            shift_type=role.get("shiftType"),
            hours_per_day=role.get("hoursPerDay"),
            period_start=overlap_start.isoformat(),
            period_end=overlap_end.isoformat(),
        )

        reason = normalize_timeoff_reason(timeoff.get("reason"))
        total_absence_hh += hh
        absence_by_reason[reason] += hh

    return total_absence_hh, dict(absence_by_reason)
