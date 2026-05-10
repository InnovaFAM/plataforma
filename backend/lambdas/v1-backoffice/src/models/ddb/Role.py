from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from models.ddb.Base import Base


class RolePayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    status: bool = True


class Role(RolePayload, Base):
    pass
