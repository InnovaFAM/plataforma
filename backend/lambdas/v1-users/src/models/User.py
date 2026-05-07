from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    email: str
    parentId: str
    phoneNumber: str
    lastLogin: str | None = None
    pictureUrl: str = Field(default="https://")
    status: Literal["pendiente", "activo", "inactivo"] = Field(default="pendiente")
