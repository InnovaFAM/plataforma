from typing import Any

from utils import add_months, month_range, overlaps_period


def build_dashboard_payload(
    all_services: list[dict[str, Any]],
    services: list[dict[str, Any]],
    roles_by_service: dict[str, list[dict[str, Any]]],
    selected_month: str,
    projection_months: int,
    selected_statuses: list[str],
    selected_services: list[str],
) -> dict[str, Any]:
    window_start, _ = month_range(selected_month)
    _, window_end = month_range(add_months(selected_month, projection_months - 1))

    population_by_project = build_population_by_project(
        services=services,
        roles_by_service=roles_by_service,
        selected_month=selected_month,
        projection_months=projection_months,
    )

    roles_table = []

    total_required = 0
    total_confirmed = 0
    total_proposed = 0

    for service in services:
        service_code = service["code"]
        service_name = service.get("name", service_code)

        roles = roles_by_service.get(service_code, [])

        for role in roles:
            if not overlaps_period(
                role.get("startedAt"),
                role.get("endedAt"),
                window_start,
                window_end,
            ):
                continue

            required = int(role.get("required", 0))
            confirmed = int(role.get("confirmed", 0))
            proposed = int(role.get("proposed", 0))
            real = confirmed + proposed
            gap = real - required
            missing = max(required - real, 0)
            surplus = max(real - required, 0)

            total_required += required
            total_confirmed += confirmed
            total_proposed += proposed

            roles_table.append(
                {
                    "serviceId": service_code,
                    "serviceName": service_name,
                    "roleId": role["sk"].replace("ROLES#", ""),
                    "roleSk": role["sk"],
                    "roleName": role.get("roleName"),
                    "requiredCount": required,
                    "confirmedCount": confirmed,
                    "proposedCount": proposed,
                    "realCount": real,
                    "gap": gap,
                    "missingCount": missing,
                    "surplusCount": surplus,
                    "status": "complete" if gap >= 0 else "missing",
                    "startedAt": role.get("startedAt"),
                    "endedAt": role.get("endedAt"),
                }
            )

    service_schedule = build_service_schedule(
        services=services,
        roles_by_service=roles_by_service,
        selected_month=selected_month,
        projection_months=projection_months,
    )

    roles_table.sort(key=lambda x: x["gap"])

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
            },
        },
        "kpis": {
            "totalRequired": total_required,
            "totalConfirmed": total_confirmed,
            "totalProposed": total_proposed,
            "totalReal": total_confirmed + total_proposed,
            "totalGap": total_confirmed + total_proposed - total_required,
            "totalMissing": max(total_required - (total_confirmed + total_proposed), 0),
            "totalSurplus": max((total_confirmed + total_proposed) - total_required, 0),
        },
        "charts": {
            "populationByProject": population_by_project,
            "serviceSchedule": service_schedule,
        },
        "rolesTable": roles_table,
    }


def build_service_schedule(
    services: list[dict[str, Any]],
    roles_by_service: dict[str, list[dict[str, Any]]],
    selected_month: str,
    projection_months: int,
) -> list[dict[str, Any]]:
    result = []

    for offset in range(projection_months):
        month = add_months(selected_month, offset)
        period_start, period_end = month_range(month)

        required_total = 0
        confirmed_total = 0
        proposed_total = 0

        for service in services:
            service_code = service["code"]
            roles = roles_by_service.get(service_code, [])

            for role in roles:
                if not overlaps_period(
                    role.get("startedAt"),
                    role.get("endedAt"),
                    period_start,
                    period_end,
                ):
                    continue

                required_total += int(role.get("required", 0))
                confirmed_total += int(role.get("confirmed", 0))
                proposed_total += int(role.get("proposed", 0))

        real = confirmed_total + proposed_total

        result.append(
            {
                "month": month,
                "required": required_total,
                "confirmed": confirmed_total,
                "proposed": proposed_total,
                "real": real,
                "gap": real - required_total,
                "missingCount": max(required_total - real, 0),
                "surplusCount": max(real - required_total, 0),
            }
        )

    return result


def build_population_by_project(
    services: list[dict[str, Any]],
    roles_by_service: dict[str, list[dict[str, Any]]],
    selected_month: str,
    projection_months: int,
) -> list[dict[str, Any]]:
    result = []

    months = [add_months(selected_month, offset) for offset in range(projection_months)]

    for service in services:
        service_code = service["code"]
        service_name = service.get("name", service_code)
        roles = roles_by_service.get(service_code, [])

        max_required = 0
        max_confirmed = 0
        max_proposed = 0

        for month in months:
            period_start, period_end = month_range(month)

            required_total = 0
            confirmed_total = 0
            proposed_total = 0

            for role in roles:
                if not overlaps_period(
                    role.get("startedAt"),
                    role.get("endedAt"),
                    period_start,
                    period_end,
                ):
                    continue

                required_total += int(role.get("required", 0))
                confirmed_total += int(role.get("confirmed", 0))
                proposed_total += int(role.get("proposed", 0))

            max_required = max(max_required, required_total)
            max_confirmed = max(max_confirmed, confirmed_total)
            max_proposed = max(max_proposed, proposed_total)

        real = max_confirmed + max_proposed

        if max_required > 0 or max_confirmed > 0 or max_proposed > 0:
            result.append(
                {
                    "serviceId": service_code,
                    "serviceName": service_name,
                    "required": max_required,
                    "confirmed": max_confirmed,
                    "proposed": max_proposed,
                    "real": real,
                    "gap": real - max_required,
                    "missingCount": max(max_required - real, 0),
                    "surplusCount": max(real - max_required, 0),
                }
            )

    return result
