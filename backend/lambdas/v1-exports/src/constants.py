import os

ENV = os.environ.get("ENV", "stage")
REGION_NAME = os.environ.get("REGION_NAME", "us-east-1")
TABLE_NAME = os.environ.get("TABLE_NAME", f"CoreBusiness_{ENV}")
EXPORT_BUCKET = os.environ.get("EXPORT_BUCKET", f"innovafam-{ENV}")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "soporte@innovafam.cl")

DEFAULT_TTL_SECONDS = int(os.getenv("EXPORT_URL_TTL_SECONDS", "86400"))


EXPORT_COLLABS_COLUMNS = [
    ("name", "Nombre"),
    ("rut", "RUT"),
    ("email", "Email"),
    ("position", "Cargo"),
    ("personalNumber", "Teléfono personal"),
    ("workNumber", "Teléfono laboral"),
    ("supervisor", "Supervisor"),
    ("assigned", "Asignado"),
    ("assignments", "Servicios asignados"),
    ("contract.startAt", "Inicio contrato"),
    ("contract.type", "Tipo contrato"),
    ("shift.type", "Turno"),
    ("shift.startedAt", "Inicio turno"),
    ("shift.endedAt", "Fin turno"),
    ("vacationBalance", "Saldo vacaciones"),
    ("status", "Activo"),
    ("address", "Dirección"),
    ("annex", "Anexo"),
    ("pictureUrl", "URL foto"),
    ("sk", "SK"),
]

SERVICE_EXPORT_COLUMNS = [
    ("code", "Código"),
    ("name", "Servicio"),
    ("contractNumber", "N° contrato"),
    ("status", "Estado"),
    ("priority", "Prioridad"),
    ("startDate", "Fecha inicio"),
    ("endDate", "Fecha término"),
    ("client.name", "Cliente"),
    ("client.rut", "RUT cliente"),
    ("client.sk", "SK cliente"),
    ("division.name", "División"),
    ("division.number", "N° división"),
    ("division.sk", "SK división"),
    ("chore.name", "Faena"),
    ("chore.code", "Código faena"),
    ("chore.sk", "SK faena"),
    ("managers", "Administradores"),
    ("submanagers", "Subadministradores"),
    ("parentId", "Parent ID"),
    ("sk", "SK"),
]

SERVICE_DETAIL_ROLE_COLUMNS = [
    ("roleName", "Rol"),
    ("required", "Requeridos"),
    ("proposed", "Propuestos"),
    ("confirmed", "Confirmados"),
    ("shiftType", "Turno"),
    ("hoursPerDay", "Horas día"),
    ("weeklyHours", "Horas semana"),
    ("startedAt", "Inicio rol"),
    ("endedAt", "Fin rol"),
    ("assignmentsCount", "Asignaciones"),
    ("sk", "SK rol"),
]

SERVICE_DETAIL_ASSIGNMENT_COLUMNS = [
    ("roleName", "Rol"),
    ("collab.name", "Colaborador"),
    ("collab.roleName", "Cargo colaborador"),
    ("collabId", "ID colaborador"),
    ("status", "Estado asignación"),
    ("clearance", "Acreditado"),
    ("startedAt", "Inicio asignación"),
    ("endedAt", "Fin asignación"),
    ("parentId", "Servicio"),
    ("entityId", "SK rol"),
    ("sk", "SK asignación"),
]
