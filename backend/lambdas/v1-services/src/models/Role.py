from decimal import Decimal

from models.CoreBusiness import CoreBusiness


class Role(CoreBusiness):
    name: str
    hoursPerDay: Decimal
    shiftType: str
    weeklyHours: int
    status: bool | None = None
