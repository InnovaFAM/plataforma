import json
from ast import Dict
from pprint import pprint
from typing import final

from min_dotenv import hyd_env

hyd_env(".env")

from app import lambda_handler as handler


@final
class MockContext:
    def __init__(self):
        self.function_name = "v1-users"
        self.memory_limit_in_mb = 128
        self.invoked_function_arn = "arn::v1-users"
        self.aws_request_id = "123456789"


def lambda_handler(api_event: Dict):
    context = MockContext()
    response = handler(api_event, context)
    pprint(response)


if __name__ == "__main__":
    # with open("./tests/events/create.json", "r") as f:
    # with open("./tests/events/get_users.json", "r") as f:
    with open("./tests/events/get_user_by_id.json", "r") as f:
        # with open("./tests/events/get_roles_with_users.json", "r") as f:
        data = json.load(f)
        lambda_handler(data)
