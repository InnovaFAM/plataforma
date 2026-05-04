from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_HTTP

from aws.cognito import create_user
from aws.ddb import (
    get_all_items,
    get_item,
    get_items_by_email,
    get_paginated_items,
    log_activity,
    put_item,
    query_users_by_parent_id,
    update_item,
)
from constants import ACTIVITY_TABLE_NAME
from logger import logger
from models.General import PatchUserBodyRequest
from models.SystemRole import SystemRole
from models.User import User, UserPayload
from utils import error_response

app = APIGatewayHttpResolver()
pk = "FAM#USERS"


@app.get("/users/roles/data")
def get_data():
    try:
        system_roles = get_all_items("FAM#SYSTEMROLES", ["sk", "name", "description"])

        for sr in system_roles:
            sr["users"] = query_users_by_parent_id(pk, sr["sk"])

        users = get_all_items(
            pk,
            names=[
                "sk",
                "name",
                "pictureUrl",
                "email",
                "status",
                "parentId",
                "lastLogin",
            ],
        )
        return {
            "roles": system_roles,
            "users": users,
        }
    except Exception as e:
        return error_response("GetRolesError", str(e))


@app.get("/users")
def get_users():
    try:
        next_key = app.current_event.get_query_string_value(
            name="nextKey", default_value=None
        )
        page_size = app.current_event.get_query_string_value(
            name="pageSize", default_value="10"
        )

        response = get_paginated_items(
            pk,
            start_key=next_key,
            page_size=int(page_size),
            names=["sk", "pictureUrl", "email", "status", "parentId", "lastLogin"],
        )

        return response.model_dump_json(exclude_none=True)
    except Exception as e:
        return error_response("GetUsersError", str(e))


@app.get("/users/<user_id>")
def get_user_by_id(user_id: str):
    try:
        if user_json := get_item(pk, f"USERS#{user_id}"):
            user = User(**user_json)
            if role_json := get_item("FAM#SYSTEMROLES", user.parentId):
                return {
                    **user_json,
                    "role": role_json,
                }
        return error_response("GetUserByIDError", "User not found")
    except Exception as e:
        return error_response("GetUserByIDError", str(e))


@app.get("/users/<user_id>/activities")
def get_users_activities(user_id: str):
    try:
        next_key = app.current_event.get_query_string_value(
            name="nextKey", default_value=None
        )
        page_size = app.current_event.get_query_string_value(
            name="pageSize", default_value="10"
        )

        response = get_paginated_items(
            f"USER#{user_id}",
            start_key=next_key,
            table_name=ACTIVITY_TABLE_NAME,
            page_size=int(page_size),
            names=["sk", "category", "data"],
        )

        return response.model_dump_json(exclude_none=True)
    except Exception as e:
        return error_response("GetUsersError", str(e))


@app.post("/users")
def post():
    try:
        body = UserPayload(**app.current_event.json_body)
        user = get_items_by_email(pk, body.email)
        if not user:
            sub = create_user(body.email, body.name)
            new_user = body.model_dump(exclude_none=True)
            _ = put_item(pk, f"USERS#{sub}", new_user)
            try:
                if user_sub := app.context.get("user_sub"):
                    log_activity(user_sub, "CREATE_USER", new_user)
            except Exception as err:
                logger.warning("LogError", str(err))
            return Response(
                status_code=201,
            )
        else:
            return error_response("PostUserError", "User already exists")
    except Exception as e:
        return error_response("PostUserError", str(e))


@app.patch("/users")
def update():
    try:
        body = PatchUserBodyRequest(**app.current_event.json_body)
        item = body.model_dump(exclude_none=True, exclude={"sk"})

        user = update_item(
            "FAM#USERS",
            body.sk,
            item,
        )
        try:
            if user_sub := app.context.get("user_sub"):
                log_activity(user_sub, "CREATE_USER", user)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=200,
        )
    except Exception as e:
        return error_response("PatchUserError", str(e))


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_HTTP, log_event=True)
def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    authorizer = event.get("requestContext", {}).get("authorizer", {})

    if method == "OPTIONS":
        return {"statusCode": 204, "body": ""}

    jwt_claims = authorizer.get("jwt", {}).get("claims", {})
    custom_ctx = authorizer if not jwt_claims else {}

    if user_sub := (
        jwt_claims.get("sub") or custom_ctx.get("sub") or custom_ctx.get("principalId")
    ):
        app.append_context(user_sub=user_sub)
    return app.resolve(event, context)
