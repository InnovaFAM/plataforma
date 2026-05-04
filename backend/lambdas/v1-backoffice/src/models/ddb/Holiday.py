from enum import Enum

from pydantic import BaseModel, ConfigDict

from models.ddb.Base import Base


class HolidayType(str, Enum):
    AUTO = "auto"
    MANUAL = "manual"


class HolidayPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    date: str
    type: HolidayType
    status: bool = True


class Holiday(HolidayPayload, Base):
    pass
