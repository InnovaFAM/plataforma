from aws_lambda_powertools.logging.correlation_paths import S3_OBJECT_LAMBDA
from aws_lambda_powertools.utilities.data_classes import S3Event
from aws_lambda_powertools.utilities.data_classes.event_source import event_source
from aws_lambda_powertools.utilities.typing import LambdaContext

from aws.bedrock import text_to_structure_json
from aws.ddb import get_certificates, put_temp_collab_certificate
from aws.textract import extract_text_from_image, extract_text_from_pdf
from logger import logger
from utils import (
    get_collab_id,
    get_file_type,
    get_types_and_codes,
    parse_temp_certificate_object,
)


@logger.inject_lambda_context(correlation_id_path=S3_OBJECT_LAMBDA, log_event=True)
@event_source(data_class=S3Event)
def lambda_handler(event: S3Event, context: LambdaContext):
    try:
        certificates = get_certificates()
        types, codes = get_types_and_codes(certificates)
        for record in event.records:
            file_key = record.s3.get_object.key
            try:
                file_type = get_file_type(file_key)
                collab_id = get_collab_id(file_key)

                match file_type:
                    case "pdf":
                        text = extract_text_from_pdf(record.s3.bucket.name, file_key)
                    case _:
                        text = extract_text_from_image(record.s3.bucket.name, file_key)
                logger.info(f"Text: {text}")
                result = text_to_structure_json(text, types=types, codes=codes)
                cc = parse_temp_certificate_object(collab_id, file_key, result)
                _ = put_temp_collab_certificate(cc)
                logger.info(f"Result: {cc.model_dump()}")
            except Exception as e:
                logger.warning(
                    f"Record: {record.event_time} - Key: {file_key} - failed: {str(e)}"
                )
    except Exception as e:
        logger.exception(str(e))
