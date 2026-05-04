import json

from dotenv import load_dotenv
from pprint import pprint

from aws_lambda_powertools.utilities.typing.lambda_context import LambdaContext

load_dotenv()

from app import lambda_handler as handler

def lambda_handler(sqs_event):
    context = LambdaContext()
    context._function_name = "v1-handle-authorizer"
    context._memory_limit_in_mb = 128
    context._invoked_function_arn = "arn::v1-handle-authorizer"
    context._aws_request_id = "123456789"
    response = handler(sqs_event, context)
    pprint(response)


with open('events/example.json', 'r') as f:
    data = json.load(f)
    lambda_handler(data)