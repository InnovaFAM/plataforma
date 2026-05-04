import requests

from constants import BUK_API_KEY, FAM_BUK_URL
from logger import logger
from models.Buk import (
    BukCollab,
    BukResponseCollab,
    BukResponseCollabByID,
    BukResponseCollabVacationBalance,
)

s = requests.Session()
s.headers.update({"auth_token": BUK_API_KEY})


def get_all_collabs() -> list[BukCollab] | None:
    try:
        page = 1
        total_pages = 999
        buk_collabs: list[BukCollab] = []
        while page <= total_pages:
            logger.info(f"Processing page {page} of {total_pages}")
            if response := get_paginated_collabs(page, 100):
                total_pages = response.pagination.total_pages
                buk_collabs.extend(response.data)
                page += 1
            else:
                break
        logger.info(f"Returning {len(buk_collabs)} collabs")
        return buk_collabs
    except requests.exceptions.RequestException as e:
        logger.exception({"error": {"name": "GetAllCollabsError", "message": str(e)}})
        return None


def get_paginated_collabs(
    page: int = 1, page_size: int = 10
) -> BukResponseCollab | None:
    try:
        response = s.get(
            f"{FAM_BUK_URL}/employees/active",
            params={"page_size": page_size, "page": page},
        )
        response.raise_for_status()
        return BukResponseCollab(**response.json())
    except requests.exceptions.RequestException as e:
        logger.exception({"error": {"name": "GetAllCollabsError", "message": str(e)}})
        return None


def get_vacation_balance_by_collab_id(
    collab_id: int,
) -> BukResponseCollabVacationBalance | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/employees/{collab_id}/vacations_available")
        response.raise_for_status()
        return BukResponseCollabVacationBalance.model_validate(response.json())
    except requests.exceptions.RequestException as e:
        logger.warning(
            {"error": {"name": "GetVacationBalanceError", "message": str(e)}}
        )
        return None


def get_supervisor_name_by_collab_id(collab_id: int) -> str | None:
    try:
        response = s.get(f"{FAM_BUK_URL}/employees/{collab_id}")
        response.raise_for_status()
        return BukResponseCollabByID.model_validate(response.json()).data.full_name
    except requests.exceptions.RequestException as e:
        logger.warning({"error": {"name": "GetSupervisorNameError", "message": str(e)}})
        return None
