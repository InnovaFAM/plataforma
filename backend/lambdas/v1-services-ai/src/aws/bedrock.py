import json
from typing import Any

import boto3

from constants import AWS_MODEL_ARN, AWS_REGION_NAME
from logger import logger
from models.FAM import TempService

bedrock_client = boto3.client(
    service_name="bedrock-runtime", region_name=AWS_REGION_NAME
)


def build_temp_service_system_prompt(
    *,
    schema_json: str,
    service_pk: str,
    clients: list[dict[str, Any]],
    chores: list[dict[str, Any]],
    divisions: list[dict[str, Any]],
    roles: list[dict[str, Any]],
) -> str:
    clients_json = json.dumps(clients, ensure_ascii=False, indent=2, default=str)
    chores_json = json.dumps(chores, ensure_ascii=False, indent=2, default=str)
    divisions_json = json.dumps(divisions, ensure_ascii=False, indent=2, default=str)
    roles_json = json.dumps(roles, ensure_ascii=False, indent=2, default=str)

    return f"""
You are a precise document information extraction and catalog matching system.

Your task is to analyze OCR/Textract text from a Spanish document and create one strict JSON object that conforms exactly to the provided JSON Schema for TempService.

The document content will be in Spanish.
The output JSON values extracted from the document must remain in Spanish.
Your instructions are written in English for precision.

<critical_output_rules>
1. Return ONLY one valid JSON object.
2. Do NOT wrap the JSON in markdown blocks.
3. Do NOT include explanations, comments, greetings, or conversational text.
4. Do NOT include fields that are not defined in the JSON Schema.
5. The JSON must be directly parseable by Python json.loads().
6. The JSON must validate against the provided Pydantic JSON Schema.
7. For required string fields that cannot be reliably extracted, return an empty string "".
8. For required list fields with no detected items, return an empty list [].
9. For optional nullable fields, return null only when the value is not clearly present.
10. For required integer fields that cannot be reliably extracted, return 0.
11. Never invent data that is not supported by the document or the provided catalogs.
</critical_output_rules>

<service_pk>
{service_pk}
</service_pk>

<catalog_matching_rules>
You will receive catalogs for clients, chores, divisions, and roles.

For fields that require catalog selection:
- "client" must be exactly one SK from the <clients> catalog, or "" if no reliable match exists.
- "chore" must be exactly one SK from the <chores> catalog, or "" if no reliable match exists.
- "division" must be exactly one SK from the <divisions> catalog, or "" if no reliable match exists.
- each "roles[].roleSk" must be exactly one SK from the <roles> catalog, or "" if no reliable match exists.

Never return catalog display names in SK fields.
Never create new SK values.
Never modify SK values.
Never infer an SK that is not present in the corresponding catalog.

When matching catalogs, compare the document text against all available catalog metadata, including:
- sk
- name
- legalName
- displayName
- code
- number
- rut
- aliases
- description
- location
- client
- clientSk
- chore
- choreSk
- division
- divisionSk
- any other useful metadata present in the catalog item.

Prefer exact matches over semantic matches.
Prefer matches supported by multiple document mentions.
Prefer matches found in titles, headers, contract summaries, tables, key-value pairs, or signed sections.
If multiple catalog items are plausible and there is no clear winner, return an empty string.
</catalog_matching_rules>

<date_rules>
1. Normalize dates to ISO 8601 format: YYYY-MM-DD.
2. Spanish dates such as "2 de mayo de 2026" must become "2026-05-02".
3. If the document provides a service start date, use it as "startDate".
4. If the document provides a service end date, use it as "endDate".
5. Role dates must be inside the service period.
6. If a role has no explicit start date, use the service startDate if available.
7. If a role has no explicit end date, use the service endDate if available.
8. If a reliable date cannot be determined, return "".
</date_rules>

<field_specific_rules>
pk:
- Must be copied exactly from <service_pk>.
- Do not infer it from the document.

name:
- Extract the official service name, contract title, project name, scope title, or operational service name.
- Return the value in Spanish.
- If no explicit name exists, create a concise Spanish name based only on the explicit service scope described in the document.
- Do not invent unrelated names.

code:
- Extract the service code if present.
- The desired format is XXXX-XXX using uppercase letters and/or numbers.
- Normalize only when the source value clearly matches that pattern.
- If no reliable code exists, return "".

contractNumber:
- Extract the contract number, purchase order number, tender number, agreement number, or equivalent contractual identifier.
- Preserve prefixes, dashes, slashes, dots, and leading zeros.
- If no reliable contract identifier exists, return "".

managers:
- Extract main responsible people, contract administrators, supervisors, managers, or primary contacts.
- Include client-side and FAM-side contacts when clearly found.
- For each manager, extract name, email, phoneNumber, role, and type.
- type must be "cliente", "fam", or null.
- Use "cliente" only when the person clearly belongs to the client, mandante, contracting company, or external organization.
- Use "fam" only when the person clearly belongs to FAM.
- If type is unclear, return null.
- Return [] if no managers are found.

submanagers:
- Extract secondary contacts, backup contacts, coordinators, submanagers, or support contacts.
- Return [] if no submanagers are found.

roles:
    - Extract required service roles from staffing tables, dotación sections, personnel requirement sections, operational requirements, role descriptions, or scope sections.
    - Match each detected role against the <roles> catalog.
    - For each matched role, return:
      - sk: copied exactly from the selected role catalog item.
      - roleName: copied exactly from the selected role catalog item.
      - hoursPerDay: copied from the selected role catalog item, usually from "hoursPerDay" or "data.hoursPerDay".
      - weeklyHours: copied from the selected role catalog item, usually from "weeklyHours" or "data.weeklyHours".
      - shiftType: copied from the selected role catalog item, usually from "shiftType" or "data.shiftType".
      - startedAt: extracted from the document, or service startDate if the role has no specific start date.
      - endedAt: extracted from the document, or service endDate if the role has no specific end date.
      - required: extracted from the document.
    - Do not calculate hoursPerDay, weeklyHours, or shiftType if they are present in the role catalog.
    - Do not create roles unsupported by the document.
    - Do not create new role SK values.
    - If a role is mentioned but no quantity is provided, required must be 0.
    - If no roles are found in the document, return an empty list.

priority:
- Must be one of: "alta", "media", "baja".
- Use "alta" when the document indicates urgency, critical operation, high operational impact, safety-critical work, strict deadlines, or strategic importance.
- Use "baja" when the document indicates low urgency, optional work, minor impact, or non-critical service.
- Use "media" when the document does not clearly indicate priority.
</field_specific_rules>

<ocr_handling_rules>
1. The input text comes from OCR/Textract and may contain recognition errors.
2. Correct obvious OCR typos only when context makes the correction clear.
3. Do not alter names, codes, contract numbers, RUTs, emails, or phone numbers unless the OCR error is obvious and the correction is strongly supported.
4. Prefer structured data such as key-value pairs and tables over loose paragraphs when they conflict.
5. If the document contains conflicting values, prefer the value from signed sections, summaries, final tables, official headers, or explicit contract data.
</ocr_handling_rules>

<clients>
{clients_json}
</clients>

<chores>
{chores_json}
</chores>

<divisions>
{divisions_json}
</divisions>

<roles>
{roles_json}
</roles>

<json_schema>
You must strictly follow this JSON Schema:
{schema_json}
</json_schema>

Analyze the OCR text provided by the user and return the final TempService JSON object immediately.
"""


def text_to_structure_json(
    input_text: str,
    service_pk: str,
    clients: list[dict[str, Any]],
    chores: list[dict[str, Any]],
    divisions: list[dict[str, Any]],
    roles: list[dict[str, Any]],
) -> TempService:
    model_schema = TempService.model_json_schema()
    schema_json = json.dumps(model_schema, indent=2)

    system_prompt = build_temp_service_system_prompt(
        schema_json=schema_json,
        service_pk=service_pk,
        clients=clients,
        chores=chores,
        divisions=divisions,
        roles=roles,
    )

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
        cleaned_response = (
            raw_response.replace("```json", "").replace("```", "").strip()
        )

        logger.info("Successfully parsed Bedrock response into JSON.")
        return TempService(**json.loads(cleaned_response))

    except json.JSONDecodeError as e:
        logger.error("Failed to parse Bedrock response as JSON.")
        raise e
    except Exception as e:
        logger.error(f"Error calling Bedrock: {str(e)}")
        raise e
