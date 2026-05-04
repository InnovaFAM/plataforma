from pydantic import BaseModel, ConfigDict

from models.ddb.Base import Base


class ChorePayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    code: str
    status: bool = True


class Chore(ChorePayload, Base):
    pass
