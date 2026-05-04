from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from models.CoreBusiness import CoreBusiness


class UserPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    email: str
    phoneNumber: str
    lastLogin: str | None = None
    pictureUrl: str = Field(default="https://")
    status: Literal["pendiente", "activo", "inactivo"] = Field(default="pendiente")


class User(UserPayload, CoreBusiness):
    pass
