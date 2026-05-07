import json
from typing import Any

import boto3

from constants import FROM_EMAIL
from models.FAM import TEMPLATE_BY_NOTIFICATION_TYPE, NotificationType


def send_notification_email(
    *,
    notification_type: NotificationType,
    to_email: str,
    template_data: dict[str, Any],
) -> str:
    ses = boto3.client("ses", region_name="us-east-1")

    template_name = TEMPLATE_BY_NOTIFICATION_TYPE[notification_type]

    response = ses.send_templated_email(
        Source=FROM_EMAIL,
        Destination={
            "ToAddresses": [to_email],
        },
        Template=template_name,
        TemplateData=json.dumps(template_data),
    )

    return response["MessageId"]
