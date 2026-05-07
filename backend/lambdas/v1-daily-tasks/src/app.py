from typing import Any

from aws_lambda_powertools.logging import correlation_paths

from aws.ddb import (
    get_all_expired_collab_certs,
    get_item,
    get_services_ended_less_than_5_days_ago,
    get_services_ending_in_x_days,
)
from aws.lbda import send_notification
from logger import logger
from utils import days_from_now, group_certs_by_pk, group_certs_by_pk_as_list


@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.EVENT_BRIDGE, log_event=True
)
def lambda_handler(event: dict[str, Any], context):
    try:
        if services_ending_in_15_days := get_services_ending_in_x_days(15):
            logger.info(
                f"Found {len(services_ending_in_15_days)} services ending in 15 days"
            )
            for service in services_ending_in_15_days:
                send_notification(
                    "SERVICE_TERMINATION_15",
                    {
                        "serviceCode": service.get("name", "Servicio FAM"),
                        "endDate": service.get("endDate", "-"),
                    },
                )
        else:
            logger.info("No services ending in 15 days")

        if services_ending_in_10_days := get_services_ending_in_x_days(10):
            logger.info(
                f"Found {len(services_ending_in_10_days)} services ending in 10 days"
            )
            for service in services_ending_in_10_days:
                send_notification(
                    "SERVICE_TERMINATION_10",
                    {
                        "serviceCode": service.get("name", "Servicio FAM"),
                        "endDate": service.get("endDate", "-"),
                    },
                )
        else:
            logger.info("No services ending in 10 days")

        if services_ended := get_services_ended_less_than_5_days_ago():
            logger.info(f"Found {len(services_ended)} services ended")
            for service in services_ended:
                send_notification(
                    "SERVICE_TERMINATED",
                    {
                        "serviceCode": service.get("name", "Servicio FAM"),
                        "endDate": service.get("endDate", "-"),
                        "daysAfterTermination": days_from_now(
                            str(service.get("endDate", "-"))
                        ),
                    },
                )
        else:
            logger.info("No services ended")

        if expired_certs := get_all_expired_collab_certs():
            logger.info(f"Found {len(expired_certs)} expired certificates")
            certs_by_collab = group_certs_by_pk_as_list(expired_certs)
            for collab in certs_by_collab:
                try:
                    collab_dict = get_item("FAM#COLLABS", collab["pk"])
                    if len(collab["certs"]) > 1:
                        send_notification(
                            "CERTIFICATE_EXPIRATION_PLUS",
                            {
                                "collaboratorName": collab_dict.get(
                                    "name", "Colaborador FAM"
                                ),
                            },
                        )
                    else:
                        send_notification(
                            "CERTIFICATE_EXPIRATION",
                            {
                                "collaboratorName": collab_dict.get(
                                    "name", "Colaborador FAM"
                                ),
                                "certificateName": collab["certs"][0].get(
                                    "name", "Certificado FAM"
                                ),
                                "expirationDate": collab["certs"][0].get(
                                    "expiredAt",
                                ),
                            },
                        )

                except Exception as e:
                    logger.exception(f"Failed to get collab {collab['pk']}: {e}")
        else:
            logger.info("No expired certificates found")

    except Exception as e:
        logger.exception(e)
        raise
