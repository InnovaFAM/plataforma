# pyright: reportMissingModuleSource=false
import requests

from constants import BUK_API_KEY, FAM_BUK_URL
from logger import logger
from models.Buk import (
    BukResponseAbsenceByID,
    BukResponseCollabByID,
    BukResponseCollabVacationBalance,
    BukResponseLicenceByID,
    BukResponsePermissionByID,
    BukResponseVacationByID,
)

s = requests.Session()
s.headers.update({"auth_token": BUK_API_KEY})


def get_vacation_balance_by_collab_id(
    collab_id: int,
) -> BukResponseCollabVacationBalance | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/employees/{collab_id}/vacations_available")
        response.raise_for_status()
        return BukResponseCollabVacationBalance.model_validate(response.json())
    except Exception as e:
        logger.warning(
            {"error": {"name": "GetVacationBalanceError", "message": str(e)}}
        )
        return None


def get_collab_by_id(collab_id: int) -> BukResponseCollabByID | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/employees/{collab_id}")
        response.raise_for_status()
        return BukResponseCollabByID.model_validate(response.json())
    except Exception as e:
        logger.warning(
            {"error": {"name": "BukResponseCollabByIDError", "message": str(e)}}
        )
        return None


def get_vacation_by_id(vacation_id: int) -> BukResponseVacationByID | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/vacations/{vacation_id}")
        response.raise_for_status()
        return BukResponseVacationByID.model_validate(response.json())
    except Exception as e:
        logger.warning(
            {"error": {"name": "BukResponseVacationByIDError", "message": str(e)}}
        )
        return None


def get_absence_by_id(absence_id: int) -> BukResponseAbsenceByID | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/absences/absence/{absence_id}")
        response.raise_for_status()
        return BukResponseAbsenceByID.model_validate(response.json())
    except Exception as e:
        logger.warning(
            {"error": {"name": "BukResponseAbsenceByIDError", "message": str(e)}}
        )
        return None


def get_permission_by_id(permission_id: int) -> BukResponsePermissionByID | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/absences/permission/{permission_id}")
        response.raise_for_status()
        return BukResponsePermissionByID.model_validate(response.json())
    except Exception as e:
        logger.warning(
            {"error": {"name": "BukResponsePermissionByIDError", "message": str(e)}}
        )
        return None


def get_licence_by_id(licence_id: int) -> BukResponseLicenceByID | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/absences/licence/{licence_id}")
        response.raise_for_status()
        return BukResponseLicenceByID.model_validate(response.json())
    except Exception as e:
        logger.warning(
            {"error": {"name": "BukResponseLicenceByIDError", "message": str(e)}}
        )
        return None
