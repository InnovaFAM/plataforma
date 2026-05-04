from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import (
    count_collabs_assigned_to_role,
    find_items_affected_by_parent_date_change,
    get_all_items,
    get_item,
    get_role_by_name,
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
        srv_role_payload = body.model_dump(exclude_none=True, exclude=set(["roleName"]))

        # check if roles exist in service
        if has_role_in_service(f"SERVICE#{service_code}", body.roleName):
            return error_response(
                "PostRoleServiceError",
                f"Role {body.roleName} already exists in service {service_code}",
            )

        # check role exist before
        if role_json := get_item("FAM#ROLES", body.roleName):
            role = Role(**role_json)
            srv_role = RoleService(
                **srv_role_payload,
                roleName=role.name,
                pk=f"SERVICE#{service_code}",
                sk=role.sk,
                hoursPerDay=role.hoursPerDay,
                shiftType=role.shiftType,
                weeklyHours=role.weeklyHours,
            )
            srv_role_json = srv_role.model_dump(
                exclude_none=True, exclude=set(["pk", "sk"])
            )
            _ = put_item(
                srv_role.pk,
                srv_role.sk,
                srv_role_json,
            )
            try:
                if user_sub := router.context.get("user_sub"):
                    log_activity(
                        user_sub,
                        "CREATE_SRV_ROLE",
                        {
                            "service_code": service_code,
                            **srv_role_json,
                        },
                    )
            except Exception as err:
                logger.warning("LogError", str(err))
            return Response(
                status_code=201,
            )
        else:
            return error_response(
                "PostRoleServiceError", f"Role {body.roleName} not found"
            )
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
        return Response(
            status_code=200,
        )
    except Exception as e:
        return error_response("PatchRoleServiceError", str(e))
