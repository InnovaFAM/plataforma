from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Manager(BaseModel):
    name: str = Field(
        ...,
        description=(
            "Full name of the main contact, manager, supervisor, coordinator, "
            "contract administrator, or responsible person found in the document. "
            "The value must remain in Spanish and must be copied as close as possible "
            "to the original document. If the name is not found, return an empty string."
        ),
    )

    email: str = Field(
        ...,
        description=(
            "Email address of the manager found in the document. "
            "Return the exact email as written. If no email is found, return an empty string."
        ),
    )

    phoneNumber: str = Field(
        ...,
        description=(
            "Phone number of the manager found in the document. "
            "Return the phone number as written, preserving country code, spaces, "
            "or symbols when present. If no phone number is found, return an empty string."
        ),
    )

    role: str | None = Field(
        default=None,
        description=(
            "Textual role, job title, or responsibility of the manager, such as "
            "'Administrador de contrato', 'Jefe de operaciones', 'Supervisor', "
            "'Coordinador', or similar. Keep the value in Spanish. "
            "Return null if the role is not explicitly stated."
        ),
    )

    type: Literal["cliente", "fam"] | None = Field(
        default=None,
        description=(
            "Indicates whether the manager belongs to the client organization or to FAM. "
            "Use 'cliente' when the person is explicitly associated with the client, mandante, "
            "contracting company, or external organization. "
            "Use 'fam' when the person is explicitly associated with FAM or the service provider. "
            "Return null if the document does not clearly indicate the type."
        ),
    )


class SubManager(BaseModel):
    name: str = Field(
        ...,
        description=(
            "Full name of a secondary contact, assistant manager, submanager, backup contact, "
            "coordinator, or support contact found in the document. "
            "The value must remain in Spanish and must be copied as close as possible "
            "to the original document. If the name is not found, return an empty string."
        ),
    )

    email: str = Field(
        ...,
        description=(
            "Email address of the submanager or secondary contact found in the document. "
            "Return the exact email as written. If no email is found, return an empty string."
        ),
    )

    phoneNumber: str = Field(
        ...,
        description=(
            "Phone number of the submanager or secondary contact found in the document. "
            "Return the phone number as written, preserving country code, spaces, "
            "or symbols when present. If no phone number is found, return an empty string."
        ),
    )


class RoleService(BaseModel):
    sk: str = Field(
        ...,
        description=(
            "SK of the selected role from the provided <roles> catalog. "
            "The value must be copied exactly from the selected catalog item. "
            "Select the role by matching the document text against the role name, job title, "
            "position, function, responsibility, aliases, or equivalent terms in the provided catalog. "
            "Never create, modify, or infer a new SK. "
            "If no reliable role match is found, return an empty string."
        ),
    )

    roleName: str = Field(
        ...,
        description=(
            "Name of the selected role from the provided <roles> catalog. "
            "The value must be copied exactly from the selected catalog item, usually from the "
            "'roleName', 'name', or equivalent field. "
            "Do not invent a role name and do not extract a different name from the document. "
            "If no reliable role match is found, return an empty string."
        ),
    )

    startedAt: str = Field(
        ...,
        description=(
            "Start date of this role assignment in ISO 8601 format YYYY-MM-DD. "
            "Extract the date from the document when the role has its own start date. "
            "If the role does not have a specific start date, use the service startDate. "
            "The date must be within the service period and must not be earlier than the service startDate. "
            "If no reliable date can be determined, return an empty string."
        ),
    )

    endedAt: str = Field(
        ...,
        description=(
            "End date of this role assignment in ISO 8601 format YYYY-MM-DD. "
            "Extract the date from the document when the role has its own end date. "
            "If the role does not have a specific end date, use the service endDate. "
            "The date must be within the service period and must not be later than the service endDate. "
            "If no reliable date can be determined, return an empty string."
        ),
    )

    required: int = Field(
        default=0,
        ge=0,
        description=(
            "Number of collaborators required for this role. "
            "Extract the quantity from staffing tables, role requirement sections, dotación, "
            "headcount, personnel requirements, or equivalent document sections. "
            "If the document mentions the role but does not specify a quantity, use 0. "
            "The value must be a non-negative integer."
        ),
    )

    hoursPerDay: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        description=(
            "Daily working hours for the selected role. "
            "This value must be copied from the selected role object in the provided <roles> catalog, "
            "usually from 'hoursPerDay' or 'data.hoursPerDay'. "
            "Do not calculate this value from the document unless the catalog does not provide it. "
            "If no reliable value is available, return 0."
        ),
    )

    weeklyHours: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        description=(
            "Weekly working hours for the selected role. "
            "This value must be copied from the selected role object in the provided <roles> catalog, "
            "usually from 'weeklyHours' or 'data.weeklyHours'. "
            "Do not calculate this value from the document unless the catalog does not provide it. "
            "If no reliable value is available, return 0."
        ),
    )

    shiftType: str = Field(
        ...,
        description=(
            "Shift type for the selected role. "
            "This value must be copied from the selected role object in the provided <roles> catalog, "
            "usually from 'shiftType', 'data.shiftType', 'shift', 'shiftName', or equivalent field. "
            "Examples may include '5x2', '7x7', '4x3', 'Lunes a viernes', or similar. "
            "Do not invent a shift type. "
            "If no reliable value is available, return an empty string."
        ),
    )


class ChoreService(BaseModel):
    sk: str = Field(
        ...,
        description=(
            "SK of the selected chore/faena from the provided <chores> catalog. "
            "The value must be copied exactly from the selected catalog item. "
            "Never create, modify, or infer a new SK. "
            "If no reliable chore/faena match is found, return an empty string."
        ),
    )

    name: str = Field(
        ...,
        description=(
            "Name of the selected chore/faena from the provided <chores> catalog. "
            "Copy the value exactly from the selected catalog item. "
            "Do not invent or extract a different name from the document. "
            "If no reliable match is found, return an empty string."
        ),
    )

    code: str = Field(
        ...,
        description=(
            "Code of the selected chore/faena from the provided <chores> catalog. "
            "Copy the value exactly from the selected catalog item. "
            "If the selected catalog item has no code or no reliable match is found, return an empty string."
        ),
    )


class ClientService(BaseModel):
    sk: str = Field(
        ...,
        description=(
            "SK of the selected client from the provided <clients> catalog. "
            "The value must be copied exactly from the selected catalog item. "
            "Never create, modify, or infer a new SK. "
            "If no reliable client match is found, return an empty string."
        ),
    )

    rut: str = Field(
        ...,
        description=(
            "RUT of the selected client from the provided <clients> catalog. "
            "Copy the value exactly from the selected catalog item, preserving dots, hyphen, "
            "and verification digit when present. "
            "If the selected catalog item has no RUT or no reliable match is found, return an empty string."
        ),
    )

    name: str = Field(
        ...,
        description=(
            "Name of the selected client from the provided <clients> catalog. "
            "Copy the value exactly from the selected catalog item. "
            "Do not invent or extract a different name from the document. "
            "If no reliable match is found, return an empty string."
        ),
    )


class DivisionService(BaseModel):
    sk: str = Field(
        ...,
        description=(
            "SK of the selected division from the provided <divisions> catalog. "
            "The value must be copied exactly from the selected catalog item. "
            "Never create, modify, or infer a new SK. "
            "If no reliable division match is found, return an empty string."
        ),
    )

    name: str = Field(
        ...,
        description=(
            "Name of the selected division from the provided <divisions> catalog. "
            "Copy the value exactly from the selected catalog item. "
            "Do not invent or extract a different name from the document. "
            "If no reliable match is found, return an empty string."
        ),
    )

    number: str = Field(
        ...,
        description=(
            "Number or code of the selected division from the provided <divisions> catalog. "
            "Copy the value exactly from the selected catalog item. "
            "If the selected catalog item has no number or no reliable match is found, return an empty string."
        ),
    )


class TempService(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    pk: str = Field(
        ...,
        description=(
            "Primary partition key for the temporary service record. "
            "This value must not be inferred from the document. "
            "Copy it exactly from the input value provided in the prompt under <service_pk>."
        ),
    )

    name: str = Field(
        ...,
        description=(
            "Name of the service extracted from the document. "
            "It should describe the contracted service, project, operational service, "
            "or work to be performed. Return the name in Spanish. "
            "Prefer the official service name, contract title, project title, or main scope title. "
            "If no clear service name exists, create a concise Spanish name based only on the explicit "
            "scope described in the document."
        ),
    )

    code: str = Field(
        ...,
        description=(
            "Service code in the format XXXX-XXX, using uppercase letters and/or numbers. "
            "Extract it from the document if present. If the document contains the code in a compatible "
            "format, normalize it to XXXX-XXX only when unambiguous. "
            "Do not invent random codes. If no reliable code is found, return an empty string."
        ),
    )

    contractNumber: str = Field(
        ...,
        description=(
            "Contract number, purchase order number, tender number, agreement number, "
            "or equivalent contractual identifier extracted from the document. "
            "Return it exactly as written, preserving dashes, slashes, dots, prefixes, and leading zeros. "
            "If no contract number is found, return an empty string."
        ),
    )

    startDate: str = Field(
        ...,
        description=(
            "Start date of the service in ISO 8601 format YYYY-MM-DD. "
            "Extract the date that represents the beginning of the service, contract execution, "
            "validity period, work start, or operational start. "
            "If the document contains dates in Spanish, normalize them to YYYY-MM-DD. "
            "If no reliable start date is found, return an empty string."
        ),
    )

    endDate: str = Field(
        ...,
        description=(
            "End date of the service in ISO 8601 format YYYY-MM-DD. "
            "Extract the date that represents the end of the service, contract execution, "
            "validity period, work end, or operational end. "
            "The endDate must be equal to or later than startDate when both are present. "
            "If no reliable end date is found, return an empty string."
        ),
    )

    managers: list[Manager] = Field(
        ...,
        description=(
            "List of main managers, responsible people, administrators, supervisors, "
            "or primary contacts found in the document. Include both client-side and FAM-side managers "
            "when available. Return an empty list if no managers are found."
        ),
    )

    submanagers: list[SubManager] = Field(
        ...,
        description=(
            "List of secondary contacts, backup contacts, submanagers, coordinators, "
            "or support people found in the document. Return an empty list if no submanagers are found."
        ),
    )

    client: ClientService = Field(
        ...,
        description=(
            "Selected client object from the provided <clients> catalog. "
            "The object must contain the sk, rut, and name copied exactly from the selected catalog item. "
            "Match the document text against client name, legal name, trade name, RUT, aliases, "
            "or other available metadata. "
            "If no reliable client match is found, return an object with empty string values."
        ),
    )

    chore: ChoreService = Field(
        ...,
        description=(
            "Selected chore/faena object from the provided <chores> catalog. "
            "The object must contain the sk, name, and code copied exactly from the selected catalog item. "
            "Match the document text against chore/faena name, code, site, location, project, operation, "
            "facility, aliases, or other available metadata. "
            "If no reliable chore/faena match is found, return an object with empty string values."
        ),
    )

    division: DivisionService = Field(
        ...,
        description=(
            "Selected division object from the provided <divisions> catalog. "
            "The object must contain the sk, name, and number copied exactly from the selected catalog item. "
            "Match the document text against division name, number, code, business unit, operational area, "
            "aliases, or other available metadata. "
            "If no reliable division match is found, return an object with empty string values."
        ),
    )

    roles: list[RoleService] = Field(
        ...,
        description=(
            "List of service roles required by the document. "
            "Each role must be matched against the provided <roles> catalog and must return only the role SK. "
            "Extract roles from staffing tables, dotación sections, personnel requirement sections, "
            "scope of work, operational requirements, or equivalent sections. "
            "Do not invent roles that are not supported by the document. "
            "Do not create new role SK values. "
            "If no roles are found in the document, return an empty list."
        ),
    )

    priority: Literal["alta", "media", "baja"] = Field(
        ...,
        description=(
            "Priority of the service. The value must be one of: 'alta', 'media', or 'baja'. "
            "Use 'alta' when the document indicates urgency, critical operation, high operational impact, "
            "strict deadlines, safety-critical work, or strategic importance. "
            "Use 'baja' when the document indicates low urgency, optional work, minor impact, "
            "or non-critical service. "
            "Use 'media' when the document does not clearly indicate priority or when the priority is normal."
        ),
    )


class CoreBusiness(BaseModel):
    pk: str
    sk: str
    parentId: str | None = None
    entityId: str | None = None


class Chore(CoreBusiness):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    code: str
    status: bool = True


class Client(CoreBusiness):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    rut: str
    status: bool = True


class Division(CoreBusiness):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    number: str
    status: bool = True


class Role(CoreBusiness):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    name: str
    hoursPerDay: Decimal
    shiftType: str
    weeklyHours: Decimal
    status: bool = True
