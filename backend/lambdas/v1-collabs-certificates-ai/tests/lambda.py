import json
from pprint import pprint
from typing import final

from aws_lambda_powertools.utilities.data_classes.s3_event import S3Event

from app import lambda_handler as handler


@final
class MockContext:
    def __init__(self):
        self.function_name = "v1-collabs-certificates-ai"
        self.memory_limit_in_mb = 128
        self.invoked_function_arn = "arn::v1-collabs-certificates-ai"
        self.aws_request_id = "123456789"


def lambda_handler(api_event: S3Event):
    context = MockContext()
    response = handler(api_event, context)
    pprint(response)


if __name__ == "__main__":
    with open("./tests/events/normal.json", "r") as f:
        data = json.load(f)
        lambda_handler(data)
