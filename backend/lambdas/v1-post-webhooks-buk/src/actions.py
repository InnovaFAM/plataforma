from datetime import datetime
from decimal import Decimal
from typing import Any

from aws.ddb import delete_item, get_item, put_item, update_item
from aws.lbda import send_notification
from buk import get_collab_by_id, get_vacation_balance_by_collab_id, get_vacation_by_id
from logger import logger
from models.Fam import Contract, FAMCollab, Shift
from models.General import EmployeeEvent, EventType, VacationEvent
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
                        "reason": vacation.data.type,
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

            if employee_event.event_type == EventType.JobTermination:
                _ = send_notification(
                    "COLLAB_TERMINATION",
                    {
                        "collaboratorName": fam_collab.name,
                        "terminationDate": datetime.now().isoformat(),
                    },
                )
        else:
            fam_collab = parse_buk_to_fam(buk_collab)
            if fam_collab:
                _ = put_item(
                    "FAM#COLLABS",
                    f"COLLABS#{employee_event.employee_id}",
                    fam_collab.model_dump(exclude_none=True),
                )
    else:
        logger.warning(f"collab {employee_event.employee_id} not found in buk")
