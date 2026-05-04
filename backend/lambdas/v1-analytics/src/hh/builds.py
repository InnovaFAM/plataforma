from collections import defaultdict
from typing import Any

from hh._utils import (
    calculate_role_person_hours_in_month,
)
from logger import logger
from utils import add_months, month_range, overlaps_period, timed


def build_hh_projection_by_month(
    services: list[dict[str, Any]],
    roles_by_service: dict[str, list[dict[str, Any]]],
    selected_month: str,
    horizon_months: int,
) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []

    for offset in range(horizon_months):
        month = add_months(selected_month, offset)

        required_hh = 0.0
        confirmed_hh = 0.0
        proposed_hh = 0.0

        for service in services:
            service_code = service["code"]
            roles = roles_by_service.get(service_code, [])

            for role in roles:
                person_hours = calculate_role_person_hours_in_month(role, month)

                logger.info(
                    {
                        "debug_month": month,
                        "service_code": service_code,
                        "role_sk": role.get("sk"),
                        "role_name": role.get("roleName"),
                        "startedAt": role.get("startedAt"),
                        "endedAt": role.get("endedAt"),
                        "shiftType": role.get("shiftType"),
                        "hoursPerDay": role.get("hoursPerDay"),
                        "required": role.get("required"),
                        "person_hours": person_hours,
                    }
                )

                if person_hours <= 0:
                    continue

                required = int(role.get("required", 0))
                confirmed = int(role.get("confirmed", 0))
                proposed = int(role.get("proposed", 0))

                required_hh += required * person_hours
                confirmed_hh += confirmed * person_hours
                proposed_hh += proposed * person_hours

        covered_hh = confirmed_hh + proposed_hh
        gap_hh = covered_hh - required_hh
        coverage_pct = round((covered_hh / required_hh) * 100) if required_hh > 0 else 0

        result.append(
            {
                "month": month,
                "requiredHH": round(required_hh, 2),
                "confirmedHH": round(confirmed_hh, 2),
                "proposedHH": round(proposed_hh, 2),
                "coveredHH": round(covered_hh, 2),
                "gapHH": round(gap_hh, 2),
                "coveragePct": coverage_pct,
            }
        )

    return result


def build_hh_projection_payload(
    all_services: list[dict[str, Any]],
    filtered_services: list[dict[str, Any]],
    roles_by_service: dict[str, list[dict[str, Any]]],
    selected_month: str,
    horizon_months: int,
    selected_statuses: list[str],
    selected_services: list[str],
) -> dict[str, Any]:
    hh_projection_by_month = build_hh_projection_by_month(
        services=filtered_services,
        roles_by_service=roles_by_service,
        selected_month=selected_month,
        horizon_months=horizon_months,
    )

    total_required_hh = sum(item["requiredHH"] for item in hh_projection_by_month)
    total_covered_hh = sum(item["coveredHH"] for item in hh_projection_by_month)
    total_gap_hh = total_covered_hh - total_required_hh

    worst_month = None
    worst_month_gap_hh = None

    if hh_projection_by_month:
        worst = min(hh_projection_by_month, key=lambda x: x["gapHH"])
        worst_month = worst["month"]
        worst_month_gap_hh = worst["gapHH"]

    available_statuses = sorted(
        {
            str(status)
            for service in all_services
            if (status := service.get("status")) is not None
        }
    )

    return {
        "filters": {
            "applied": {
                "month": selected_month,
                "horizonMonths": horizon_months,
                "statuses": selected_statuses,
                "services": selected_services,
            },
            "available": {
                "services": [
                    {
                        "serviceId": service["code"],
                        "serviceName": service.get("name", service["code"]),
                        "status": service.get("status"),
                    }
                    for service in all_services
                ],
                "statuses": available_statuses,
                "horizonOptions": [6, 12, 18],
            },
        },
        "kpis": {
            "totalRequiredHH": round(total_required_hh, 2),
            "totalCoveredHH": round(total_covered_hh, 2),
            "totalGapHH": round(total_gap_hh, 2),
            "worstMonth": worst_month,
            "worstMonthGapHH": worst_month_gap_hh,
        },
        "charts": {
            "hhProjectionByMonth": hh_projection_by_month,
        },
    }
