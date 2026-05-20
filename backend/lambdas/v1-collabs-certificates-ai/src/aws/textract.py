import time

import boto3

from constants import AWS_REGION_NAME
from logger import logger

textract_client = boto3.client("textract", region_name=AWS_REGION_NAME)


def extract_text_from_pdf(bucket_name: str, file_key: str) -> str:
    logger.info(f"Iniciando extracción para s3://{bucket_name}/{file_key}")

    try:
        start_response = textract_client.start_document_text_detection(
            DocumentLocation={"S3Object": {"Bucket": bucket_name, "Name": file_key}}
        )

        job_id = start_response["JobId"]
        logger.info(f"Job sent to Textract. Job ID: {job_id}")

        while True:
            status_response = textract_client.get_document_text_detection(JobId=job_id)
            status = status_response["JobStatus"]

            if status == "SUCCEEDED":
                logger.info("Textract finished successfully!")
                break
            elif status == "FAILED":
                raise Exception(
                    "Textract failed internally while reading the document."
                )

            logger.info("Processing PDF... waiting 2 seconds.")
            time.sleep(2)

        text_lines = []
        for block in status_response.get("Blocks", []):
            if block["BlockType"] == "LINE":
                text_lines.append(block["Text"])

        full_text = "\n".join(text_lines)
        logger.info(f"Success: Extracted {len(full_text)} characters.")

        return full_text
    except Exception as e:
        logger.warning(f"Error procesando el documento en Textract: {str(e)}")
        raise e


def extract_text_from_image(bucket_name: str, file_key: str) -> str:
    logger.info(f"Iniciando extracción de imagen para s3://{bucket_name}/{file_key}")

    try:
        response = textract_client.detect_document_text(
            Document={
                "S3Object": {
                    "Bucket": bucket_name,
                    "Name": file_key,
                }
            }
        )

        text_lines: list[str] = []

        for block in response.get("Blocks", []):
            if block.get("BlockType") == "LINE":
                text = block.get("Text")
                if text:
                    text_lines.append(text)

        full_text = "\n".join(text_lines)

        logger.info(f"Success: Extracted {len(full_text)} characters from image.")

        return full_text

    except Exception as e:
        logger.warning(f"Error procesando la imagen en Textract: {str(e)}")
        raise e
