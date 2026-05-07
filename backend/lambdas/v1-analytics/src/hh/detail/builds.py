from collections import defaultdict
from typing import Any

from aws.ddb import get_hh_filters_summary, query_hh_detail_monthly_items_for_service
from hh.detail._utils import sort_months


def build_hh_detail_payload_from_analytics(
    selected_months: list[str],
    selected_services: list[str],
) -> dict[str, Any]:
    filters_summary = get_hh_filters_summary()

    available_months = sort_months(filters_summary.get("availableMonths", []))
    available_services = filters_summary.get("availableServices", [])

    months_to_query = selected_months or (
        available_months[-1:] if available_months else []
    )

    service_map = {
        service["serviceId"]: service
        for service in available_services
        if service.get("serviceId")
    }

    services_to_query = (
        selected_services if selected_services else sorted(service_map.keys())
    )

    worked_by_service: list[dict[str, Any]] = []
    absences_by_type_acc: dict[str, float] = defaultdict(float)

    total_worked_hh = 0
    total_absence_hh = 0

    for service_code in services_to_query:
        monthly_items = query_hh_detail_monthly_items_for_service(
            service_code=service_code,
            months=months_to_query,
        )

        if not monthly_items:
            continue

        monthly_by_key = {
            item["sk"].replace("MONTH#", "", 1): item for item in monthly_items
        }

        service_total_worked = 0
        service_total_absence = 0
        sub_rows = []

        service_name = service_map.get(service_code, {}).get(
            "serviceName", service_code
        )

        for month in months_to_query:
            month_item = monthly_by_key.get(month)

            worked_hh = int(month_item.get("workedHH", 0)) if month_item else 0
            absence_hh = int(month_item.get("absenceHH", 0)) if month_item else 0
            overtime_hh = int(month_item.get("overtimeHH", 0)) if month_item else 0

            service_total_worked += worked_hh
            service_total_absence += absence_hh

            if month_item:
                for reason, hours in (month_item.get("absenceByType") or {}).items():
                    absences_by_type_acc[reason] += float(hours)

            sub_rows.append(
                {
                    "month": month,
                    "workedHH": worked_hh,
                    "absenceHH": absence_hh,
                    "overtimeHH": overtime_hh,
                }
            )

        total_worked_hh += service_total_worked
        total_absence_hh += service_total_absence

        worked_by_service.append(
            {
                "serviceId": service_code,
                "serviceName": service_name,
                "totalHH": service_total_worked,
                "totalAbsenceHH": service_total_absence,
                "subRows": sub_rows,
            }
        )

    worked_by_service.sort(key=lambda x: x["totalHH"], reverse=True)

    absences_by_type = [
        {
            "type": reason,
            "hours": int(round(hours)),
        }
        for reason, hours in sorted(
            absences_by_type_acc.items(),
            key=lambda x: x[1],
            reverse=True,
        )
    ]

    active_services = len(
        [
            item
            for item in worked_by_service
            if item["totalHH"] > 0 or item["totalAbsenceHH"] > 0
        ]
    )

    absence_rate_pct = (
        round((total_absence_hh / total_worked_hh) * 100) if total_worked_hh > 0 else 0
    )

    return {
        "filters": {
            "applied": {
                "months": months_to_query,
                "services": selected_services,
            },
            "available": {
                "months": available_months,
                "services": available_services,
            },
        },
        "kpis": {
            "totalWorkedHH": total_worked_hh,
            "totalAbsenceHH": total_absence_hh,
            "activeServices": active_services,
            "absenceRatePct": absence_rate_pct,
        },
        "charts": {
            "workedHoursByService": [
                {
                    "serviceId": item["serviceId"],
                    "serviceName": item["serviceName"],
                    "workedHH": item["totalHH"],
                }
                for item in worked_by_service
            ],
            "absencesByType": absences_by_type,
        },
        "table": worked_by_service,
    }
