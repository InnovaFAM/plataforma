from aws_lambda_powertools.logging.correlation_paths import S3_OBJECT_LAMBDA
from aws_lambda_powertools.utilities.data_classes import S3Event
from aws_lambda_powertools.utilities.data_classes.event_source import event_source
from aws_lambda_powertools.utilities.typing import LambdaContext

from aws.bedrock import text_to_structure_json
from aws.ddb import get_items, put_temp_service
from aws.textract import extract_text_from_pdf
from logger import logger
from utils import (
    encode_key,
    get_file_type,
)


@logger.inject_lambda_context(correlation_id_path=S3_OBJECT_LAMBDA, log_event=True)
@event_source(data_class=S3Event)
def lambda_handler(event: S3Event, context: LambdaContext):
    try:
        chores = get_items("FAM#CHORES")
        roles = get_items("FAM#ROLES")
        divisions = get_items("FAM#DIVISIONS")
        clients = get_items("FAM#CLIENTS")
        for record in event.records:
            file_key = record.s3.get_object.key
            try:
                text = extract_text_from_pdf(record.s3.bucket.name, file_key)
                logger.info(f"Text: {text}")
                service_sk = f"TEMPS#{encode_key(file_key)}"
                ts = text_to_structure_json(
                    text, service_sk, clients, chores, divisions, roles
                )
                _ = put_temp_service(ts)
                logger.info(f"Result: {ts.model_dump()}")
            except Exception as e:
                logger.warning(
                    f"Record: {record.event_time} - Key: {file_key} - failed: {str(e)}"
                )
    except Exception as e:
        logger.exception(str(e))
