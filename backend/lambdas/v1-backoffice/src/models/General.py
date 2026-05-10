from decimal import Decimal
from this import s
from typing import Any

from pydantic import BaseModel, field_validator
from pyrut import validate_rut

from models.ddb.Certificate import Matrix
from models.ddb.Holiday import HolidayType


class PaginatedResponse(BaseModel):
    items: list[dict[str, Any]]
    last_evaluated_key: str | None = None


class PatchClientBodyRequest(BaseModel):
    sk: str
    name: str | None = None
    status: bool | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Cliente inválido")

        return v


class PatchCertificateBodyRequest(BaseModel):
    sk: str
    name: str | None = None
    code: str | None = None
    type: str | None = None
    relevance: str | None = None
    matrix: Matrix | None = None
    updateAt: str | None = None
    status: bool | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Certificado inválido")

        return v


class PatchRoleBodyRequest(BaseModel):
    sk: str
    name: str | None = None
    status: bool | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Cargo inválido")

        return v


class PatchDivisionBodyRequest(BaseModel):
    sk: str
    name: str | None = None
    number: str | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Faena inválido")

        return v


class PatchChoreBodyRequest(BaseModel):
    sk: str
    name: str | None = None
    code: str | None = None
    status: bool | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Faena inválido")

        return v


class PatchHolidayBodyRequest(BaseModel):
    sk: str
    date: str | None = None
    name: str | None = None
    type: HolidayType | None = None

    @field_validator("type")
    @classmethod
    def type_not_empty(cls, v: HolidayType) -> HolidayType:
        if v != HolidayType.MANUAL:
            raise ValueError("Tipo de feriado inválido")

        return v

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Faena inválido")

        return v


class PatchShiftBodyRequest(BaseModel):
    sk: str
    name: str | None = None
    type: str | None = None
    distribution: str | None = None
    status: bool | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Turno inválido")

        return v


class DeleteItemBodyRequest(BaseModel):
    itemHash: str
    itemType: str
    itemName: str
