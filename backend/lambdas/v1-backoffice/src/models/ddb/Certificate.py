from enum import Enum

from pydantic import BaseModel, ConfigDict

from models.ddb.Base import Base


class Matrix(str, Enum):
    CARGO = "Cargo"
    FAENA = "Faena"
    GLOBAL = "Global"


class CertificatePayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    code: str
    type: str
    relevance: str
    matrix: Matrix
    updateAt: str | None = None
    status: bool = True


class Certificate(CertificatePayload, Base):
    pass
