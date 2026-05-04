from typing import Any, Literal

from pydantic import BaseModel, field_validator

from models.Service import ChoreService, ClientService, DivisionService, Manager


class PaginatedServiceResponse(BaseModel):
    items: list[dict[str, Any]]
    last_evaluated_key: str | None = None


class PatchServiceBodyRequest(BaseModel):
    sk: str
    name: str | None = None
    code: str | None = None
    contractNumber: str | None = None
    startDate: str | None = None
    endDate: str | None = None
    managers: list[Manager] | None = None
    submanagers: list[Manager] | None = None
    priority: Literal["alta", "media", "baja"] | None = None
    chore: ChoreService | None = None
    division: DivisionService | None = None
    client: ClientService | None = None
    parentId: str | None = None
    status: Literal["boceto", "publicado"] | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Servicio inválido")

        return v


class PatchRoleServiceBodyRequest(BaseModel):
    sk: str
    required: int | None = None
    proposed: int | None = None
    confirmed: int | None = None
    startedAt: str | None = None
    endedAt: str | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Role inválido")

        return v


class PatchCollabInfoBodyRequest(BaseModel):
    name: str | None = None
    roleName: str | None = None
    compliance: int | None = None
    annex: str | None = None


class PatchCollabRoleServiceBodyRequest(BaseModel):
    startedAt: str | None = None
    endedAt: str | None = None
    clearance: bool | None = None
    status: Literal["propuesto", "confirmado"] | None = None
