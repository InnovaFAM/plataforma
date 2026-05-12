from typing import Any, Literal

from pydantic import BaseModel

from constants import ENV

NotificationType = Literal[
    "SERVICE_CONFIRMED",
    "SERVICE_PROPOSED",
    "SERVICE_ROLE_COLLAB_PROPOSED",
    "SERVICE_TERMINATION_15",
    "SERVICE_TERMINATION_10",
    "SERVICE_TERMINATED",
    "MAX_HH_SUPERATED",
    "COLLAB_VACATION_APPROVED",
    "COLLAB_TERMINATION",
    "COLLAB_ABSENCE",
    "COLLAB_LICENCE",
    "COLLAB_PERSMISSION",
    "CERTIFICATE_EXPIRATION",
    "CERTIFICATE_EXPIRATION_PLUS",
    "NEW_USER_CREATED",
]

TEMPLATE_BY_NOTIFICATION_TYPE: dict[NotificationType, str] = {
    "SERVICE_CONFIRMED": f"innovafam-{ENV}-service-confirmed",
    "SERVICE_PROPOSED": f"innovafam-{ENV}-service-proposed",
    "SERVICE_ROLE_COLLAB_PROPOSED": f"innovafam-{ENV}-service-role-collab-proposed",
    "COLLAB_VACATION_APPROVED": f"innovafam-{ENV}-collab-vacation-approved",
    "COLLAB_TERMINATION": f"innovafam-{ENV}-collab-termination",
    "SERVICE_TERMINATION_15": f"innovafam-{ENV}-service-termination-15",
    "SERVICE_TERMINATION_10": f"innovafam-{ENV}-service-termination-10",
    "SERVICE_TERMINATED": f"innovafam-{ENV}-service-terminated",
    "MAX_HH_SUPERATED": f"innovafam-{ENV}-max-hh-superated",
    "COLLAB_ABSENCE": f"innovafam-{ENV}-collab-absence",
    "COLLAB_LICENCE": f"innovafam-{ENV}-collab-licence",
    "COLLAB_PERSMISSION": f"innovafam-{ENV}-collab-permission",
    "CERTIFICATE_EXPIRATION": f"innovafam-{ENV}-certificate-expiration",
    "CERTIFICATE_EXPIRATION_PLUS": f"innovafam-{ENV}-certificate-expiration-plus",
    "NEW_USER_CREATED": f"innovafam-{ENV}-new-user-created",
}


class CoreBusiness(BaseModel):
    pk: str
    sk: str
    parentId: str | None = None
    entityId: str | None = None


class Event(BaseModel):
    type: NotificationType
    createdAt: str
    payload: dict[str, Any]


class Notification(Event, CoreBusiness):
    pass
