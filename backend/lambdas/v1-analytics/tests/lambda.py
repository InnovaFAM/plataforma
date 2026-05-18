import json
from ast import Dict
from pprint import pprint
from typing import final

from app import lambda_handler as handler


@final
class MockContext:
    def __init__(self):
        self.function_name = "v1-analytics"
        self.memory_limit_in_mb = 128
        self.invoked_function_arn = "arn::v1-analytics"
        self.aws_request_id = "123456789"


def lambda_handler(api_event: Dict):
    context = MockContext()
    response = handler(api_event, context)
    print(response)


if __name__ == "__main__":
    # with open("./tests/events/home.json", "r") as f:
    with open("./tests/events/hh/get_projection.json", "r") as f:
        # with open("./tests/events/projects/get_projects.json", "r") as f:
        # with open("./tests/events/get_projects_month.json", "r") as f:
        # with open("./tests/events/get_projects_services.json", "r") as f:
        # with open("./tests/events/get_projects_statuses.json", "r") as f:
        # with open("./tests/events/get_projects_full.json", "r") as f:
        data = json.load(f)
        lambda_handler(data)
