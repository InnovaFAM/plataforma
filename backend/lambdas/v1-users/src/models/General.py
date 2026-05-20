from typing import Any, Literal

from pydantic import BaseModel, field_validator


class PaginatedResponse(BaseModel):
    items: list[dict[str, Any]]
    last_evaluated_key: str | None = None


class PatchUserBodyRequest(BaseModel):
    sk: str
    phoneNumber: str | None = None
    name: str | None = None
    parentId: str | None = None
    lastLogin: str | None = None
    status: Literal["pendiente", "activo", "inactivo"] | None = None

    @field_validator("sk")
    @classmethod
    def sk_not_empty(cls, v: str) -> str:
        if v.find("#") == -1:
            raise ValueError("Usuario inválido")

        return v
