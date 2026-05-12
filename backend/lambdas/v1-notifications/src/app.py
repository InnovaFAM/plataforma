from typing import Any

from aws.ddb import get_all_items, get_users_by_role, put_item
from aws.ses import send_notification_email
from logger import logger
from models.FAM import Event


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event: dict[str, Any], context):
    try:
        notification = Event.model_validate(event)

        if notification.type == "NEW_USER_CREATED":
            _ = send_notification_email(
                notification_type=notification.type,
                to_email=notification.payload["email"],
                template_data={
                    **notification.payload,
                },
            )
            return

        system_roles = get_all_items("FAM#SYSTEMROLES", ["notifications", "sk"])
        for role in system_roles:
            if notification.type in role.get("notifications", []):
                users = get_users_by_role(
                    "FAM#USERS",
                    role.get("sk", ""),
                    ["sk", "sendEmail", "name", "email"],
                )
                for user in users:
                    try:
                        logger.info(f"Notifying user {user['sk']}")
                        _ = put_item(
                            user["sk"],
                            f"NOTIFICATION#{notification.createdAt}",
                            notification.model_dump(),
                        )
                        if user.get("sendEmail", True):
                            _ = send_notification_email(
                                notification_type=notification.type,
                                to_email=user["email"],
                                template_data={
                                    "appName": "InnovaFAM",
                                    "recipientName": user.get(
                                        "name", "Usuario InnovaFAM"
                                    ),
                                    "actionUrl": "https://app.tudominio.com/services/SV-1001",
                                    **notification.payload,
                                },
                            )
                            logger.info(
                                f"Email {notification.type} sent to user {user['sk']}"
                            )
                        else:
                            logger.info(f"sendEmail false for user {user['sk']}")
                    except Exception as e:
                        logger.warning(f"Error notifying user {user['sk']}: {e}")
    except Exception as e:
        logger.exception(e)
        raise
