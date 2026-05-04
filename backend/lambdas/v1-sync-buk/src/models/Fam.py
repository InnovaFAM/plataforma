from decimal import Decimal

from pydantic import BaseModel


class Base(BaseModel):
    pk: str
    sk: str


class Contract(BaseModel):
    type: str
    startAt: str
    endAt: str | None = None


class Shift(BaseModel):
    type: str | None = None
    description: str | None = None
    startedAt: str | None = None
    endedAt: str | None = None


class FAMCollab(Base):
    sk: str
    name: str
    email: str
    position: str
    address: str
    rut: str
    contract: Contract
    shift: Shift
    annex: str | None = None
    supervisor: str | None = None
    vacationBalance: Decimal | None = None
    pictureUrl: str | None = None
    personalNumber: int | None = None
    workNumber: int | None = None
    status: bool = True
    assigned: bool = False
    pk: str = "FAM#COLLABS"
