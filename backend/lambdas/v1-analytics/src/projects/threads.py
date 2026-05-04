from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

from aws import query_roles_by_service


def get_roles_for_services(
    services: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    """
    Ejecuta queries en paralelo para no esperar servicio por servicio.
    """

    roles_by_service = {}

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {}

        for service in services:
            service_code = service["code"]
            futures[executor.submit(query_roles_by_service, service_code)] = (
                service_code
            )

        for future in as_completed(futures):
            service_code = futures[future]
            roles_by_service[service_code] = future.result()

    return roles_by_service
