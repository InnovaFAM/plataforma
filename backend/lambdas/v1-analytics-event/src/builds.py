from collections import defaultdict
from datetime import datetime

from typing_extensions import Any

from utils import (
    build_role_map,
    calculate_assignment_theoretical_hh,
    calculate_assignment_timeoff_hh_and_reasons,
    calculate_person_hours_for_period,
    intersect_period,
    month_range,
    months_between,
    overlaps_period,
)


def build_projection_items_for_service(
    service: dict[str, Any],
    roles: list[dict[str, Any]],  # no usado por ahora
    start_date: str,
    end_date: str,
) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []

    for month in months_between(start_date, end_date):
        month_start, month_end = month_range(month)

        required_hh = 0.0
        confirmed_hh = 0.0
        proposed_hh = 0.0

        for role in roles:
            if not overlaps_period(
                role.get("startedAt"),
                role.get("endedAt"),
                month_start,
                month_end,
            ):
                continue

            role_start = role.get("startedAt")
            role_end = role.get("endedAt") or "9999-12-31"

            overlap = intersect_period(role_start, role_end, month_start, month_end)
            if not overlap:
                continue

            overlap_start, overlap_end = overlap

            person_hours = calculate_person_hours_for_period(
                shift_type=role.get("shiftType"),
                hours_per_day=role.get("hoursPerDay"),
                period_start=overlap_start.isoformat(),
                period_end=overlap_end.isoformat(),
            )

            required = int(role.get("required", 0))
            confirmed = int(role.get("confirmed", 0))
            proposed = int(role.get("proposed", 0))

            required_hh += required * person_hours
            confirmed_hh += confirmed * person_hours
            proposed_hh += proposed * person_hours

        covered_hh = confirmed_hh + proposed_hh
        gap_hh = covered_hh - required_hh

        items.append(
            {
                "pk": f"HHPROJECTION#{month}",
                "sk": f"SERVICE#{service['code']}",
                "serviceId": service["code"],
                "serviceName": service.get("name", service["code"]),
                "requiredHH": int(round(required_hh)),
                "confirmedHH": int(round(confirmed_hh)),
                "proposedHH": int(round(proposed_hh)),
                "coveredHH": int(round(covered_hh)),
                "gapHH": int(round(gap_hh)),
                "updatedAt": datetime.utcnow().isoformat(),
            }
        )

    return items


def build_detail_items_for_service(
    service: dict[str, Any],
    roles: list[dict[str, Any]],
    assignments: list[dict[str, Any]],
    collab_timeoffs: dict[str, list[dict[str, Any]]],
    start_date: str,
    end_date: str,
) -> list[dict[str, Any]]:
    """
    Retorna items mensuales de HH detail para un servicio.

    workedHH:
        HH teóricas de asignaciones - HH ausencias por TimeOff

    absenceHH:
        HH perdidas por TimeOff

    overtimeHH:
        por ahora 0

    absenceByType:
        desglose de ausencias por razón
    """
    items: list[dict[str, Any]] = []
    role_map = build_role_map(roles)

    for month in months_between(start_date, end_date):
        month_start, month_end = month_range(month)

        worked_hh = 0.0
        absence_hh = 0.0
        overtime_hh = 0.0
        absence_by_type: dict[str, float] = defaultdict(float)

        for assignment in assignments:
            if not overlaps_period(
                assignment.get("startedAt"),
                assignment.get("endedAt"),
                month_start,
                month_end,
            ):
                continue

            role_sk = assignment.get("entityId")
            if not role_sk:
                continue

            role = role_map.get(role_sk)
            if not role:
                continue

            theoretical_hh = calculate_assignment_theoretical_hh(
                assignment=assignment,
                role=role,
                range_start=month_start,
                range_end=month_end,
            )

            collab_id = assignment.get("collabId")
            timeoffs = collab_timeoffs.get(collab_id, []) if collab_id else []

            assignment_absence_hh, assignment_absence_by_reason = (
                calculate_assignment_timeoff_hh_and_reasons(
                    assignment=assignment,
                    role=role,
                    timeoffs=timeoffs,
                    range_start=month_start,
                    range_end=month_end,
                )
            )

            effective_worked_hh = max(theoretical_hh - assignment_absence_hh, 0)

            worked_hh += effective_worked_hh
            absence_hh += assignment_absence_hh

            for reason, hours in assignment_absence_by_reason.items():
                absence_by_type[reason] += hours

        items.append(
            {
                "pk": f"HHDETAIL#SERVICE#{service['code']}",
                "sk": f"MONTH#{month}",
                "serviceId": service["code"],
                "serviceName": service.get("name", service["code"]),
                "workedHH": int(round(worked_hh)),
                "absenceHH": int(round(absence_hh)),
                "overtimeHH": int(round(overtime_hh)),
                "absenceByType": {
                    reason: int(round(hours))
                    for reason, hours in absence_by_type.items()
                },
                "updatedAt": datetime.utcnow().isoformat(),
            }
        )

    return items


def build_filter_summary_item(services: list[dict[str, Any]]) -> dict[str, Any]:
    valid_services = [s for s in services if s.get("code")]
    if not valid_services:
        available_months: list[str] = []
    else:
        global_start = min(s["startDate"] for s in valid_services if s.get("startDate"))
        global_end = max(s["endDate"] for s in valid_services if s.get("endDate"))
        available_months = months_between(global_start, global_end)

    return {
        "pk": "HHFILTERS",
        "sk": "SUMMARY",
        "availableMonths": available_months,
        "availableServices": [
            {
                "serviceId": s["code"],
                "serviceName": s.get("name", s["code"]),
            }
            for s in valid_services
        ],
        "updatedAt": datetime.utcnow().isoformat(),
    }
