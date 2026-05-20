from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.event_handler.api_gateway import Response
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_HTTP

from aws.cognito import create_user, delete_user, disable_user, enable_user
from aws.ddb import (
    delete_item,
    get_all_items,
    get_item,
    get_items_by_email,
    get_paginated_items,
    get_user_notifications_items,
    log_activity,
    put_item,
    query_users_by_parent_id,
    update_item,
)
from aws.lbda import send_notification
from constants import ACTIVITY_TABLE_NAME
from logger import logger
from models.General import PatchUserBodyRequest
from models.User import UserPayload
from utils import error_response, get_payload_jwt

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
        )

        return response.model_dump_json(exclude_none=True)
    except Exception as e:
        return error_response("GetUsersError", str(e))


@app.get("/users/<user_id>")
def get_user_by_id(user_id: str):
    try:
        if user_json := get_item(pk, f"USERS#{user_id}"):
            if role_json := get_item("FAM#SYSTEMROLES", user_json.get("parentId", "")):
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
        return error_response("GetUsersActivitiesError", str(e))


@app.get("/users/<user_id>/notifications")
def get_user_notifications(user_id: str):
    try:
        next_key = app.current_event.get_query_string_value(
            name="nextKey", default_value=None
        )
        page_size = app.current_event.get_query_string_value(
            name="pageSize", default_value="10"
        )

        response = get_user_notifications_items(
            f"USERS#{user_id}",
            start_key=next_key,
            page_size=int(page_size),
            names=["type", "createdAt", "payload"],
        )

        return response.model_dump_json(exclude_none=True)
    except Exception as e:
        return error_response("GetUsersNotificationsError", str(e))


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

            try:
                _ = send_notification(
                    {
                        "firstName": body.name,
                        "email": body.email,
                    }
                )
            except Exception as err:
                logger.warning("NotificationError", str(err))
            return Response(
                status_code=201, body=f"User {new_user['name']} created successfully"
            )
        else:
            return error_response("PostUserError", "User already exists")
    except Exception as e:
        return error_response("PostUserError", str(e))


@app.patch("/users")
def update():
    try:
        body = PatchUserBodyRequest(**app.current_event.json_body)

        if body.lastLogin is None:
            user_sub = app.context.get("user_sub", None)
            if user_sub is None:
                return error_response(
                    "PatchUserError", "Usuario no autorizado", status_code=401
                )
        if user_dict := get_item("FAM#USERS", body.sk):
            item = body.model_dump(exclude_none=True, exclude={"sk"})

            if body.lastLogin and user_dict["status"] == "pendiente":
                item["status"] = "activo"

            if user_dict["status"] == "inactivo" and body.status == "activo":
                enable_user(user_dict["email"])

            if user_dict["status"] == "activo" and body.status == "inactivo":
                disable_user(user_dict["email"])

            user = update_item(
                "FAM#USERS",
                body.sk,
                item,
            )
            try:
                if user_sub := app.context.get("user_sub"):
                    log_activity(user_sub, "UPDATE_USER", user)
            except Exception as err:
                logger.warning("LogError", str(err))
            return Response(status_code=200, body="user updated successfully")

        return error_response("PatchUserError", "Usuario no existe")
    except Exception as e:
        return error_response("PatchUserError", str(e))


@app.delete("/users/<user_id>")
def delete_users(user_id: str):
    try:
        user_sub = app.context.get("user_sub", None)
        if user_sub is None:
            return error_response(
                "DeleteUserError", "Usuario no autorizado", status_code=401
            )

        if user_dict := get_item("FAM#USERS", f"USERS#{user_id}"):
            if delete_user(user_dict["email"]):
                _ = delete_item(
                    "FAM#USERS",
                    f"USERS#{user_id}",
                )
                try:
                    if user_sub := app.context.get("user_sub"):
                        log_activity(user_sub, "DEL_USER", user_dict)
                except Exception as err:
                    logger.warning("LogError", str(err))

                return Response(
                    status_code=204,
                    body="User deleted successfully",
                )

            return error_response(
                "DeleteUserError",
                f"Error al eliminar usuario {user_id}",
            )

        return error_response(
            "DeleteUserError",
            f"Usuario {user_id} no existe",
        )
    except Exception as e:
        return error_response("DeleteUserError", str(e))


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_HTTP, log_event=True)
def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    authorization = event.get("headers", {}).get("authorization", {})

    if method == "OPTIONS":
        return {"statusCode": 204, "body": ""}

    jwt_claims = get_payload_jwt(authorization)

    if jwt_claims is not None:
        if user_sub := jwt_claims.get("sub"):
            app.append_context(user_sub=user_sub)
    return app.resolve(event, context)
