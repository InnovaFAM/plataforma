from itertools import batched
from typing import Any

from aws import batch_write, get_item, update_item
from buk import get_all_collabs, get_collab_by_id
from logger import logger
from models.Fam import FAMCollab
from utils import parse_buk_to_fam, parse_update_collab


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event: dict[str, str], context):
    try:
        mode = event.get("mode", "full")

        if mode == "update":
            if collabId := event.get("collabId"):
                buk_collab = get_collab_by_id(collabId)
                fam_collab_dict = get_item("FAM#COLLABS", f"COLLABS#{collabId}")
                if buk_collab and fam_collab_dict:
                    fam_collab = FAMCollab(**fam_collab_dict)
                    item = parse_update_collab(fam_collab, buk_collab.data)

                    _ = update_item(
                        "FAM#COLLABS",
                        f"COLLABS#{event.get('collabId')}",
                        item,
                    )
                else:
                    logger.warning(f"Collab not found: {collabId}")
            else:
                logger.warning("No collabId provided for update mode")
        else:
            if buk_collabs := get_all_collabs():
                fam_collabs: list[dict[str, Any]] = []
                collab_updated = 0
                for buk_collab in buk_collabs:
                    if fam_collab_dict := get_item(
                        "FAM#COLLABS", f"COLLABS#{buk_collab.id}"
                    ):
                        fam_collab = FAMCollab(**fam_collab_dict)
                        item = parse_update_collab(fam_collab, buk_collab)
                        _ = update_item(
                            "FAM#COLLABS",
                            f"COLLABS#{event.get('collabId')}",
                            item,
                        )
                        collab_updated += 1
                    else:
                        if fam_collab := parse_buk_to_fam(buk_collab):
                            fam_collabs.append(fam_collab.model_dump(exclude_none=True))
                for chunk in batched(fam_collabs, 25):
                    _ = batch_write(list(chunk))

                logger.info(
                    f"Buk: {len(buk_collabs)} | Created: {len(fam_collabs)} | Updated: {collab_updated}"
                )
                return True
            else:
                logger.warning("No collabs found")
        return False
    except Exception as e:
        logger.exception(e)
        raise
