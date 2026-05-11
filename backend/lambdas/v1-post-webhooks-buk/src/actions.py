from datetime import datetime
from decimal import Decimal
from typing import Any, Literal

from aws.ddb import delete_item, get_item, put_item, update_item
from aws.lbda import send_notification
from buk import (
    get_absence_by_id,
    get_collab_by_id,
    get_licence_by_id,
    get_permission_by_id,
    get_vacation_balance_by_collab_id,
    get_vacation_by_id,
)
from logger import logger
from models.Fam import Contract, FAMCollab, Shift
from models.General import (
    AbsenceEvent,
    EmployeeEvent,
    EventType,
    LicenceEvent,
    PermissionEvent,
    VacationEvent,
)
from utils import parse_buk_to_fam


def vacations(vacation_event: VacationEvent):
    if vacation := get_vacation_by_id(vacation_event.vacation_id):
        employee_id = vacation.data.employee_id
        match vacation.data.status:
            case "approved" | "pre_approved":
                _ = put_item(
                    f"COLLABS#{employee_id}",
                    f"TIMEOFF#{vacation_event.vacation_id}",
                    {
                        "startedAt": vacation.data.start_date,
                        "endedAt": vacation.data.end_date,
                        "parentId": "FAM#TIMEOFFS",
                        "entityId": f"TIMEOFF#{vacation_event.vacation_id}",
                        "reason": f"{vacation.data.status} - {vacation.data.type}",
                    },
                )
                if vacation.data.status == "approved":
                    if vbs := get_vacation_balance_by_collab_id(employee_id):
                        _ = update_item(
                            "FAM#COLLABS",
                            f"COLLABS#{employee_id}",
                            {
                                "vacationBalance": Decimal(
                                    str(round(sum(v.stock for v in vbs.vacations), 2))
                                ),
                            },
                        )
                    _ = send_notification(
                        "COLLAB_VACATION_APPROVED",
                        {
                            "collaboratorName": employee_id,
                            "startDate": vacation.data.start_date,
                            "endDate": vacation.data.end_date,
                        },
                    )

            case "rejected":
                _ = delete_item(
                    f"COLLABS#{employee_id}", f"TIMEOFF#{vacation_event.vacation_id}"
                )
            case _:
                pass


def employees(employee_event: EmployeeEvent):
    if buk_collab_dict := get_collab_by_id(employee_event.employee_id):
        buk_collab = buk_collab_dict.data

        if fam_collab_dict := get_item(
            "FAM#COLLABS", f"COLLABS#{employee_event.employee_id}"
        ):
            fam_collab = FAMCollab(**fam_collab_dict)

            if employee_event.event_type == EventType.JobTermination:
                _ = delete_item(
                    "FAM#COLLABS",
                    f"COLLABS#{employee_event.employee_id}",
                )
                _ = send_notification(
                    "COLLAB_TERMINATION",
                    {
                        "collaboratorName": fam_collab.name,
                        "terminationDate": datetime.now().isoformat(),
                    },
                )
                logger.info(f"collab {employee_event.employee_id} terminated")
                return

            item: dict[str, Any] = {
                "status": employee_event.employment_status == "activo",
                "shift": Shift(
                    description=buk_collab.current_job.custom_attributes.shift_description,
                    type=buk_collab.current_job.custom_attributes.shift_type,
                    startedAt=buk_collab.current_job.custom_attributes.shift_started_at,
                    endedAt=buk_collab.current_job.custom_attributes.shift_ended_at,
                ).model_dump(exclude_none=True),
                "contract": Contract(
                    type=buk_collab.current_job.contract_type,
                    startAt=buk_collab.current_job.start_date,
                    endAt=buk_collab.current_job.contract_finishing_date_1 or None,
                ).model_dump(exclude_none=True),
            }

            if buk_collab.phone != fam_collab.personalNumber:
                item["personalNumber"] = buk_collab.phone

            if buk_collab.current_job.role.name != fam_collab.position:
                item["position"] = buk_collab.current_job.role.name

            if buk_collab.office_phone != fam_collab.workNumber:
                item["workNumber"] = buk_collab.office_phone

            if buk_collab.address != fam_collab.address:
                item["address"] = buk_collab.address

            if buk_collab.current_job.custom_attributes.anexo:
                item["annex"] = buk_collab.current_job.custom_attributes.anexo

            if vbs := get_vacation_balance_by_collab_id(buk_collab.id):
                item["vacationBalance"] = Decimal(
                    str(round(sum(v.stock for v in vbs.vacations), 2))
                )
            if supervisor := get_collab_by_id(buk_collab.id):
                item["supervisor"] = supervisor.data.full_name

            if buk_collab.picture_url != fam_collab.pictureUrl:
                item["pictureUrl"] = buk_collab.picture_url

            _ = update_item(
                "FAM#COLLABS",
                f"COLLABS#{employee_event.employee_id}",
                item,
            )
            logger.info(f"collab {employee_event.employee_id} updated")
        else:
            fam_collab = parse_buk_to_fam(buk_collab)
            if fam_collab:
                _ = put_item(
                    "FAM#COLLABS",
                    f"COLLABS#{employee_event.employee_id}",
                    fam_collab.model_dump(exclude_none=True),
                )
            logger.info(f"collab {employee_event.employee_id} created")
    else:
        logger.warning(f"collab {employee_event.employee_id} not found in buk")


def absences(
    event_type: Literal["absence_create", "absence_update", "absence_destroy"],
    absence_event: AbsenceEvent,
):
    if buk_absence_response := get_absence_by_id(absence_event.absence_id):
        buk_absence = buk_absence_response.data
        if event_type == "absence_destroy":
            if item_dict := get_item(
                f"COLLABS#{buk_absence.employee_id}",
                f"TIMEOFF#{absence_event.absence_id}",
            ):
                _ = delete_item(
                    f"COLLABS#{buk_absence.employee_id}",
                    f"TIMEOFF#{absence_event.absence_id}",
                )
                logger.info(f"absence {absence_event.absence_id} deleted")
            else:
                logger.warning(
                    f"absence {absence_event.absence_id} not found to delete"
                )
            return

        logger.info(f"absence {absence_event.absence_id} - {buk_absence.status}")
        match buk_absence.status:
            case "approved":
                _ = put_item(
                    f"COLLABS#{buk_absence.employee_id}",
                    f"TIMEOFF#{absence_event.absence_id}",
                    {
                        "startedAt": buk_absence.start_date,
                        "endedAt": buk_absence.end_date,
                        "parentId": "FAM#TIMEOFFS",
                        "entityId": f"TIMEOFF#{absence_event.absence_id}",
                        "reason": f"{buk_absence.status} - {buk_absence.absence_type_code} - {buk_absence.justification}",
                    },
                )
                _ = send_notification(
                    "COLLAB_ABSENCE",
                    {
                        "collaboratorName": buk_absence.employee_id,
                        "startDate": buk_absence.start_date,
                        "endDate": buk_absence.end_date,
                        "reason": f"{buk_absence.status} - {buk_absence.absence_type_code} - {buk_absence.justification}",
                    },
                )
                logger.info(f"absence {absence_event.absence_id} added")
            case _:
                logger.warning(f"absence {absence_event.absence_id} status not handled")

    else:
        logger.warning(f"absence {absence_event.absence_id} not found in buk")


def permissions(
    event_type: Literal["permission_create", "permission_update", "permission_destroy"],
    permission_event: PermissionEvent,
):
    if buk_permission_response := get_permission_by_id(permission_event.permission_id):
        buk_permission = buk_permission_response.data
        if event_type == "permission_destroy":
            if item_dict := get_item(
                f"COLLABS#{buk_permission.employee_id}",
                f"TIMEOFF#{permission_event.permission_id}",
            ):
                _ = delete_item(
                    f"COLLABS#{buk_permission.employee_id}",
                    f"TIMEOFF#{permission_event.permission_id}",
                )
                logger.info(f"permission {permission_event.permission_id} deleted")
            else:
                logger.warning(
                    f"permission {permission_event.permission_id} not found to delete"
                )
            return

        logger.info(
            f"permission {permission_event.permission_id} - {buk_permission.status}"
        )
        match buk_permission.status:
            case "approved":
                _ = put_item(
                    f"COLLABS#{buk_permission.employee_id}",
                    f"TIMEOFF#{permission_event.permission_id}",
                    {
                        "startedAt": buk_permission.start_date,
                        "endedAt": buk_permission.end_date,
                        "parentId": "FAM#TIMEOFFS",
                        "entityId": f"TIMEOFF#{permission_event.permission_id}",
                        "reason": f"{buk_permission.status} - {buk_permission.permission_type_code} - {buk_permission.justification}",
                    },
                )
                _ = send_notification(
                    "COLLAB_PERMISSION",
                    {
                        "collaboratorName": buk_permission.employee_id,
                        "startDate": buk_permission.start_date,
                        "endDate": buk_permission.end_date,
                        "reason": f"{buk_permission.status} - {buk_permission.permission_type_code} - {buk_permission.justification}",
                    },
                )
                logger.info(f"permission {permission_event.permission_id} added")
            case _:
                logger.warning(
                    f"permission {permission_event.permission_id} status not handled"
                )
    else:
        logger.warning(f"permission {permission_event.permission_id} not found in buk")


def licences(
    event_type: Literal["licence_create", "licence_update", "licence_destroy"],
    licence_event: LicenceEvent,
):
    if buk_licence_response := get_licence_by_id(licence_event.licence_id):
        buk_licence = buk_licence_response.data
        if event_type == "licence_destroy":
            if item_dict := get_item(
                f"COLLABS#{buk_licence.employee_id}",
                f"TIMEOFF#{licence_event.licence_id}",
            ):
                _ = delete_item(
                    f"COLLABS#{buk_licence.employee_id}",
                    f"TIMEOFF#{licence_event.licence_id}",
                )
                logger.info(f"licence {licence_event.licence_id} deleted")
            else:
                logger.warning(
                    f"licence {licence_event.licence_id} not found to delete"
                )
            return

        logger.info(f"licence {licence_event.licence_id} - {buk_licence.status}")
        match buk_licence.status:
            case "approved":
                _ = put_item(
                    f"COLLABS#{buk_licence.employee_id}",
                    f"TIMEOFF#{licence_event.licence_id}",
                    {
                        "startedAt": buk_licence.start_date,
                        "endedAt": buk_licence.end_date,
                        "parentId": "FAM#TIMEOFFS",
                        "entityId": f"TIMEOFF#{licence_event.licence_id}",
                        "reason": f"{buk_licence.status} - {buk_licence.licence_type} - {buk_licence.licence_type_code}",
                    },
                )

                _ = send_notification(
                    "COLLAB_LICENCE",
                    {
                        "collaboratorName": buk_licence.employee_id,
                        "startDate": buk_licence.start_date,
                        "endDate": buk_licence.end_date,
                        "reason": f"{buk_licence.status} - {buk_licence.licence_type} - {buk_licence.licence_type_code}",
                    },
                )
                logger.info(f"licence {licence_event.licence_id} added")
            case _:
                logger.warning(f"licence {licence_event.licence_id} status not handled")
    else:
        logger.warning(f"licence {licence_event.licence_id} not found in buk")
