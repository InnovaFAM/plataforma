from enum import Enum

from pydantic import BaseModel


class EventType(str, Enum):
    VacationCreate = "vacation_create"
    VacationUpdate = "vacation_update"
    AbsenceCreate = "absence_create"
    AbsenceUpdate = "absence_update"
    AbsenceDestroy = "absence_destroy"
    JobMovement = "job_movement"
    JobTermination = "job_termination"
    JobHire = "job_hire"
    EmployeeUpdate = "employee_update"
    PermissionCreate = "permission_create"
    PermissionUpdate = "permission_update"
    PermissionDestroy = "permission_destroy"
    LicenceCreate = "licence_create"
    LicenceUpdate = "licence_update"
    LicenceDestroy = "licence_destroy"


class Event(BaseModel):
    event_type: EventType
    date: str
    tenant_url: str
    metadata: dict[str, str] | None = None


class VacationEvent(Event):
    vacation_id: int


class EmployeeEvent(Event):
    employee_id: int
    employment_status: str


class Body(BaseModel):
    data: Event


class AbsenceEvent(Event):
    absence_id: int


class PermissionEvent(Event):
    permission_id: int


class LicenceEvent(Event):
    licence_id: int
