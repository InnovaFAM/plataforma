import json

import boto3

from constants import AWS_MODEL_ARN, AWS_REGION_NAME
from logger import logger
from models.General import Structure

bedrock_client = boto3.client(
    service_name="bedrock-runtime", region_name=AWS_REGION_NAME
)


def text_to_structure_json(
    input_text: str, types: list[str], codes: list[str]
) -> Structure:
    model_schema = Structure.model_json_schema()
    schema_json = json.dumps(model_schema, indent=2)

    system_prompt = f"""
    You are an expert data extraction system specializing in HR and educational documents.
    Your ONLY task is to analyze the provided OCR text from a document (which will be in Spanish) and extract the key information into a strict, valid JSON format.

    <rules>
    1. You must return ONLY a valid JSON object.
    2. DO NOT wrap the JSON in markdown blocks (e.g., do not use ```json or ```).
    3. DO NOT include any greetings, explanations, or conversational text.
    4. If a specific piece of information is not present in the text, you MUST set its value to null (do not invent or guess).
    5. Ensure dates are formatted as YYYY-MM-DD if possible. If only the year is present, use YYYY.
    6. Correct obvious OCR typos in names or institutions based on context, but do not alter the core meaning.
    </rules>

    <types_certificates>
    {",".join(types)}
    </types_certificates>

    <codes_certificates>
    {",".join(codes)}
    </codes_certificates>

    <json_schema>
    You must strictly follow this JSON structure:
    {schema_json}
    </json_schema>

    Analyze the text provided by the user, choose the certificate type and code and output the raw JSON immediately.
    """

    messages = [{"role": "user", "content": [{"text": input_text}]}]

    try:
        response = bedrock_client.converse(
            modelId=AWS_MODEL_ARN,
            messages=messages,
            system=[{"text": system_prompt}],
            inferenceConfig={
                "maxTokens": 4000,
                "temperature": 0.1,
            },
        )

        raw_response = response["output"]["message"]["content"][0]["text"]
        logger.info(f"Raw response: {raw_response}")
        cleaned_response = (
            raw_response.replace("```json", "").replace("```", "").strip()
        )
        parsed_json = Structure(**json.loads(cleaned_response))
        logger.info("Successfully parsed Bedrock response into JSON.")

        return parsed_json

    except json.JSONDecodeError as e:
        logger.error("Failed to parse Bedrock response as JSON.")
        raise e
    except Exception as e:
        logger.error(f"Error calling Bedrock: {str(e)}")
        raise e
