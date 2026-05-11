from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict

from models.CoreBusiness import CoreBusiness


class ChoreService(BaseModel):
    sk: str
    name: str
    code: str


class ClientService(BaseModel):
    sk: str
    rut: str
    name: str


class DivisionService(BaseModel):
    sk: str
    name: str
    number: str


class ManagerBase(BaseModel):
    name: str
    email: str
    phoneNumber: str


class Manager(ManagerBase):
    role: str | None = None
    type: Literal["cliente", "fam"] | None = None


class SubContract(BaseModel):
    companyName: str
    contractManagers: list[ManagerBase]
    startDate: str
    endDate: str


class ServicePayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    code: str
    contractNumber: str
    startDate: str
    endDate: str
    managers: list[Manager]
    submanagers: list[SubContract]
    priority: Literal["alta", "media", "baja"]
    chore: ChoreService
    division: DivisionService
    client: ClientService | None = None
    parentId: str | None = None
    status: Literal["boceto", "publicado"]


class Service(ServicePayload, CoreBusiness):
    pass


class RoleServiceShift(BaseModel):
    sk: str
    shiftType: str
    weeklyHours: Decimal
    hoursPerDay: Decimal


# pk=SERVICES#<SERVICE_CODE> sk=ROLES#<ROLE_NAME>
class RoleServicePayload(BaseModel):
    sk: str
    roleName: str
    startedAt: str
    endedAt: str
    shift: RoleServiceShift
    required: int = 1
    proposed: int = 0
    confirmed: int = 0


class RoleService(RoleServicePayload, CoreBusiness):
    pass


class CollabInfo(BaseModel):
    name: str
    shiftType: str
    weeklyHours: int
    hoursPerDay: Decimal
    roleName: str
    compliance: int | None = None
    annex: str | None = None


class CollabRoleServicePayload(BaseModel):
    roleName: str
    startedAt: str
    endedAt: str
    clearance: bool | None = False
    status: Literal["propuesto", "confirmado"]


# pk=COLLABS#<COLLAB_ID> sk=SERVICES#<SERVICE_CODE>#ROLES#<ROLE_NAME>
# parentId:SERVICES#<SERVICE_CODE> entityId:ROLES#<ROLE_NAME>
class CollabRoleService(CollabRoleServicePayload, CoreBusiness):
    serviceCode: str
    collabId: str
    collab: CollabInfo
