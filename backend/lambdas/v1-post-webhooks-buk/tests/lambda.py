import json

from dotenv import load_dotenv

load_dotenv()
from app import lambda_handler


class LambdaContext:
    function_name = "innovafam-v1-post-webhooks-buk-stage"
    memory_limit_in_mb = 128
    invoked_function_arn = (
        "arn:aws:lambda:us-east-1:683953625718:function:"
        "innovafam-v1-post-webhooks-buk-stage"
    )
    aws_request_id = "local-test-request-id"


# with open("./tests/events/vacation_create.json", "r", encoding="utf-8") as f:
# with open("./tests/events/employee_termination.json", "r", encoding="utf-8") as f:
with open("./tests/events/absence_create.json", "r", encoding="utf-8") as f:
    event = json.load(f)

response = lambda_handler(event, LambdaContext())

print(json.dumps(response, indent=2, ensure_ascii=False))
