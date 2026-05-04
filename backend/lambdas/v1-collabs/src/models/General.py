from typing import Any

from pydantic import BaseModel

from models.FAM import CoreBusiness


class PaginatedCollabResponse(BaseModel):
    items: list[dict[str, Any]]
    last_evaluated_key: str | None = None


class PostRoleBodyRequest(CoreBusiness):
    roleName: str
    startedAt: str
    endedAt: str
    required: int
    proposed: int
    confirmed: int
