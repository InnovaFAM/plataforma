from pydantic import BaseModel, ConfigDict

from models.ddb.Base import Base


class DivisionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    number: str


class Division(DivisionPayload, Base):
    status: bool = True
    pass
