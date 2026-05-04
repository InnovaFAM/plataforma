from pydantic import BaseModel, ConfigDict, field_validator
from pyrut import format_rut, validate_rut

from models.ddb.Base import Base


class ClientPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    rut: str
    status: bool = True

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError(f"Nombre no puede ser vacío")
        return v

    @field_validator("rut")
    @classmethod
    def rut_validate(cls, v: str) -> str:
        if not validate_rut(v):
            raise ValueError(f"Rut inválido")
        f = format_rut(v, dots=False)
        return f


class Client(ClientPayload, Base):
    pass
