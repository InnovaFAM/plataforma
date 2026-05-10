from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import (
    count_collabs_assigned_to_role,
    delete_item,
    find_items_affected_by_parent_date_change,
    get_all_items,
    get_item,
    has_role_in_service,
    log_activity,
    put_item,
    update_item,
)
from logger import logger
from models.General import PatchRoleServiceBodyRequest
from models.Role import Role
from models.Service import RoleService, RoleServicePayload
from utils import error_response

router = Router()


@router.get("/")
def get_roles_in_service(service_code: str):
    try:
        response = get_all_items(f"SERVICE#{service_code}")

        return response
    except Exception as e:
        return error_response("GetRoleServiceError", str(e))


@router.post("/")
def create_role_in_service(service_code: str):
    try:
        body = RoleServicePayload(**router.current_event.json_body)
        srv_role_payload = body.model_dump(exclude_none=True, exclude=set(["sk"]))
        srv_role_payload["parentId"] = "ROLES#SERVICES"

        # check if roles exist in service
        if has_role_in_service(f"SERVICE#{service_code}", body.sk):
            return error_response(
                "PostRoleServiceError",
                f"Role {body.roleName} already exists in service {service_code}",
            )

        _ = put_item(
            f"SERVICE#{service_code}",
            body.sk,
            srv_role_payload,
        )
        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(
                    user_sub,
                    "CREATE_SRV_ROLE",
                    {
                        "serviceCode": service_code,
                        **srv_role_payload,
                    },
                )
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=201, body="Role in Service created successfully")
    except Exception as e:
        return error_response("PostRoleServiceError", str(e))


@router.patch("/")
def update_role_in_service(service_code: str):
    try:
        body = PatchRoleServiceBodyRequest(**router.current_event.json_body)

        response = get_item(f"SERVICE#{service_code}", body.sk)
        srv_role = RoleService(**response)
        if not srv_role:
            return error_response(
                "PatchRoleServiceError",
                f"Role {body.sk} not found in service {service_code}",
            )

        # check if exists collabs assigned if required changes
        if body.required is not None:
            old_required = srv_role.required
            if body.required < old_required:
                len_srv_role_collabs = count_collabs_assigned_to_role(
                    f"SERVICE#{service_code}"
                )
                if len_srv_role_collabs > body.required:
                    return error_response(
                        "PatchRoleServiceError",
                        f"Cannot reduce required collabs from {len_srv_role_collabs} to {body.required}. Must delete assigned collabs first.",
                    )

        # check if date range affects collabs assigned
        if body.startedAt is not None and body.endedAt is not None:
            affected_collabs = find_items_affected_by_parent_date_change(
                f"SERVICE#{service_code}",
                body.startedAt,
                body.endedAt,
            )
            if affected_collabs:
                return error_response(
                    "PatchRoleServiceError",
                    f"Cannot change date range: {len(affected_collabs)} collabs are currently assigned to this role and their dates would be affected.",
                )

        srv_role = update_item(
            f"SERVICE#{service_code}",
            body.sk,
            body.model_dump(exclude_none=True, exclude={"sk"}),
        )
        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(
                    user_sub,
                    "UPDATE_SRV_ROLE",
                    srv_role,
                )
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(status_code=200, body="Role in Service updated successfully")
    except Exception as e:
        return error_response("PatchRoleServiceError", str(e))


@router.delete("/<hash>")
def delete_role_in_service(service_code: str, hash: str):
    try:
        if ce := get_item(f"SERVICE#{service_code}", f"ROLES#{hash}"):
            _ = delete_item(
                f"SERVICE#{service_code}",
                f"ROLES#{hash}",
            )
            try:
                if user_sub := router.context.get("user_sub"):
                    log_activity(user_sub, "DEL_SRV_ROLE", ce)
            except Exception as err:
                logger.warning("LogError", str(err))
            return Response(
                status_code=204, body="Role in Service deleted successfully"
            )

        return error_response(
            "DeleteRoleServiceError",
            f"No existe el role {hash} en el servicio {service_code}",
        )
    except Exception as e:
        return error_response("DeleteRoleServiceError", str(e))
