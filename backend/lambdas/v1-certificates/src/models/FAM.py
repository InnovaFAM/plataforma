from pydantic import BaseModel, ConfigDict


class CoreBusiness(BaseModel):
    pk: str
    sk: str
    parentId: str | None = None
    entityId: str | None = None


class CertificatePayload(BaseModel):
    certificate: str
    assignedAt: str
    assignedBy: str


class CertificateRolePayload(CertificatePayload):
    role: str


class CertificateRole(CoreBusiness, CertificateRolePayload):
    certificate: str
    role: str
    assignedAt: str
    assignedBy: str


class CertificateChorePayload(CertificatePayload):
    chore: str


class CertificateChore(CoreBusiness, CertificateChorePayload):
    pass
