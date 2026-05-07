from decimal import Decimal
from typing import Any

from buk import get_collab_by_id, get_vacation_balance_by_collab_id
from logger import logger
from models.Buk import BukCollab
from models.Fam import Contract, FAMCollab, Shift


def parse_buk_to_fam(buk_collab: BukCollab) -> FAMCollab | None:
    try:
        fam_collab = FAMCollab(
            sk=f"COLLABS#{buk_collab.id}",
            name=buk_collab.full_name,
            email=buk_collab.email,
            shift=Shift(
                description=buk_collab.current_job.custom_attributes.shift_description,
                type=buk_collab.current_job.custom_attributes.shift_type,
                startedAt=buk_collab.current_job.custom_attributes.shift_started_at,
                endedAt=buk_collab.current_job.custom_attributes.shift_ended_at,
            ),
            position=buk_collab.current_job.role.name,
            address=f"{buk_collab.address}, {buk_collab.city}, {buk_collab.region}",
            rut=buk_collab.rut,
            contract=Contract(
                type=buk_collab.current_job.contract_type,
                startAt=buk_collab.current_job.start_date,
                endAt=buk_collab.current_job.contract_finishing_date_1 or None,
            ),
        )

        if buk_collab.picture_url:
            fam_collab.pictureUrl = buk_collab.picture_url
        if buk_collab.phone:
            fam_collab.personalNumber = int(buk_collab.phone)
        if buk_collab.current_job.custom_attributes.anexo:
            fam_collab.annex = buk_collab.current_job.custom_attributes.anexo
        if buk_collab.office_phone:
            fam_collab.workNumber = int(buk_collab.office_phone)
        if vbs := get_vacation_balance_by_collab_id(buk_collab.id):
            fam_collab.vacationBalance = Decimal(
                str(round(sum(v.stock for v in vbs.vacations), 2))
            )
        if collab := get_collab_by_id(str(buk_collab.id)):
            fam_collab.supervisor = collab.data.full_name
        logger.info({"collab_id": buk_collab.id, "status": "ok"})
        return fam_collab
    except Exception as e:
        logger.error({"error": {"name": "ParseBukError", "message": str(e)}})
        return None


def parse_update_collab(fam_collab: FAMCollab, buk_collab: BukCollab) -> dict[str, Any]:

    item: dict[str, Any] = {
        "status": buk_collab.status == "activo",
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

    return item
