from itertools import batched
from typing import Any

from aws_lambda_powertools.logging import correlation_paths

from aws import batch_write
from buk import get_all_collabs
from logger import logger
from utils import parse_buk_to_fam


@logger.inject_lambda_context(
    correlation_id_path=correlation_paths.EVENT_BRIDGE, log_event=True
)
def lambda_handler(event, context):
    try:
        if buk_collabs := get_all_collabs():
            fam_collabs: list[dict[str, Any]] = []
            for collab in buk_collabs:
                if fam_collab := parse_buk_to_fam(collab):
                    fam_collabs.append(fam_collab.model_dump(exclude_none=True))
            logger.info(f"Buk: {len(buk_collabs)} | Parsed {len(fam_collabs)}")
            for chunk in batched(fam_collabs, 25):
                _ = batch_write(list(chunk))

            return True
        return False
    except Exception as e:
        logger.exception(e)
        raise
