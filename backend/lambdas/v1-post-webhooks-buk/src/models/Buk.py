from decimal import Decimal
from typing import ClassVar

from pydantic import BaseModel, ConfigDict, Field


class Pagination(BaseModel):
    count: int
    total_pages: int
    next: str | None = None
    previous: str | None = None


class Role(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    id: int
    code: str
    name: str
    description: str | None = None


class Boss(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    id: int


class CustomAttributes(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    anexo: str | None = Field(alias="Nombre Contrato / Proyecto", default=None)
    shift_description: str | None = Field(alias="Descripción del turno", default=None)
    shift_type: str | None = Field(alias="Turno", default=None)
    shift_started_at: str | None = Field(alias="Inicio del turno ", default=None)
    shift_ended_at: str | None = Field(alias="Fin del turno", default=None)


class CurrentJob(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    role: Role
    boss: Boss
    contract_type: str
    start_date: str
    custom_attributes: CustomAttributes
    contract_finishing_date_1: str | None = None


class BukCollab(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    id: int
    full_name: str
    email: str
    personal_email: str
    current_job: CurrentJob
    address: str
    city: str
    region: str
    rut: str
    picture_url: str | None = None
    phone: str | None = None
    degree: str | None = None
    office_phone: str | None = None


class BukResponseCollab(BaseModel):
    data: list[BukCollab]
    pagination: Pagination


class BukResponseCollabByID(BaseModel):
    data: BukCollab
    errors: list[str] | None = None


class BukVacation(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    id: int
    employee_id: int
    start_date: str
    end_date: str
    type: str
    status: str


class BukResponseVacationByID(BaseModel):
    data: BukVacation
    errors: list[str] | None = None


class BukAbsence(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    id: int
    employee_id: int
    start_date: str
    end_date: str
    status: str
    justification: str | None = None
    absence_type_code: str


class BukPermission(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    id: int
    employee_id: int
    start_date: str
    end_date: str
    status: str
    justification: str | None = None
    permission_type_code: str


class BukResponseAbsenceByID(BaseModel):
    data: BukAbsence
    errors: list[str] | None = None


class BukResponsePermissionByID(BaseModel):
    data: BukPermission
    errors: list[str] | None = None


class Vacation(BaseModel):
    name: str
    stock: float = 0.0


class BukResponseCollabVacationBalance(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    employee_id: int
    vacations: list[Vacation]


class BukLicence(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="allow")
    id: int
    employee_id: int
    start_date: str
    end_date: str
    status: str
    licence_type_code: str
    licence_type: str
    justification: str | None = None
    motivo: str | None = None


class BukResponseLicenceByID(BaseModel):
    data: BukLicence
    errors: list[str] | None = None
