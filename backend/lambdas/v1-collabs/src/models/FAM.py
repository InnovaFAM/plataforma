from decimal import Decimal
from enum import Enum
from posix import strerror
from typing import Literal

from pydantic import BaseModel, field_validator


class CoreBusiness(BaseModel):
    pk: str
    sk: str
    parentId: str | None = None
    entityId: str | None = None


class CollabRoleServiceMini(BaseModel):
    sk: str
    serviceName: str


class Contract(BaseModel):
    type: str
    startAt: str
    endAt: str | None = None


class Shift(BaseModel):
    type: str | None = None
    description: str | None = None
    startedAt: str | None = None
    endedAt: str | None = None


class Collab(CoreBusiness):
    pk: str = "FAM#COLLABS"
    name: str
    email: str
    position: str
    address: str
    rut: str
    contract: Contract
    annex: str | None = None
    supervisor: str | None = None
    vacationBalance: Decimal | None = None
    pictureUrl: str | None = None
    personalNumber: int | None = None
    workNumber: int | None = None
    compliance: Decimal | None = None
    shift: Shift | None = None
    assignments: list[CollabRoleServiceMini] | None = None
    status: bool = True


class CollabCertificatePayload(BaseModel):
    name: str
    code: str
    type: str
    createdAt: str
    expiredAt: str
    institution: str
    tags: list[str]
    description: str
    key: str
    status: bool = True

    @field_validator("key")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if v.find("/") == -1:
            raise ValueError("Formato key inválido")
        return v


class CollabCertificate(CollabCertificatePayload, CoreBusiness):
    pass


class CollabEvaluationCategoryCriteria(BaseModel):
    name: str
    order: int
    result: int
    note: str | None = None


class CollabEvaluationCategory(BaseModel):
    name: str
    order: int
    criteria: list[CollabEvaluationCategoryCriteria]
    result: Decimal

    @field_validator("result")
    @classmethod
    def validate_result(cls, v):
        return Decimal(str(v))


class CollabEvaluationPayload(BaseModel):
    createdBy: str
    createdAt: str
    type: Literal["General", "Por Servicio"]
    result: Decimal
    categories: list[CollabEvaluationCategory]
    service: CollabRoleServiceMini | None = None

    @field_validator("result")
    @classmethod
    def validate_result(cls, v):
        return Decimal(str(v))


class CollabEvaluation(CollabEvaluationPayload, CoreBusiness):
    pass


class CollabInfo(BaseModel):
    name: str
    roleName: str
    compliance: int | None = None
    annex: str | None = None


class CollabRoleService(CoreBusiness):
    roleName: str
    collabId: str
    serviceCode: str
    startedAt: str
    endedAt: str
    collab: CollabInfo
    status: Literal["propuesto", "confirmado"]
    clearance: bool = False


class CertificateRoleMatrix(CoreBusiness):
    certificate: str
    role: str
    assignedAt: str
    assignedBy: str


class Matrix(str, Enum):
    CARGO = "Cargo"
    FAENA = "Faena"
    GLOBAL = "Global"


class Certificate(CoreBusiness):
    name: str
    code: str
    type: str
    relevance: str
    matrix: Matrix
    updateAt: str | None = None
    status: bool = True
