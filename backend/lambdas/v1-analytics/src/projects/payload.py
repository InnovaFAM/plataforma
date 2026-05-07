from aws.ddb import get_roles_for_services, query_services
from projects.builds import build_dashboard_payload


def get_payload(selected_month: str, statuses: list[str], service_ids: list[str]):

    all_services = query_services()
    filtered_services = query_services(
        statuses=statuses,
        service_ids=service_ids,
    )

    roles_by_service = get_roles_for_services(filtered_services)

    return build_dashboard_payload(
        all_services=all_services,
        services=filtered_services,
        roles_by_service=roles_by_service,
        selected_month=selected_month,
        projection_months=6,
        selected_statuses=statuses,
        selected_services=service_ids,
    )
