from decimal import Decimal

from pydantic import BaseModel, ConfigDict, field_validator

from models.ddb.Base import Base


class ShiftData(BaseModel):
    hoursPerDay: Decimal
    shiftType: str
    weeklyHours: Decimal


class ShiftPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    type: str
    data: ShiftData
    distribution: str
    status: bool = True

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v:
            raise ValueError(f"Nombre no puede ser vacío")
        return v


class Shift(ShiftPayload, Base):
    pass
