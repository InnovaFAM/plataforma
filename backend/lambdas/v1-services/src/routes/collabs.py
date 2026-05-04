from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import (
    add_assignment_to_collab,
    delete_item,
    get_item,
    log_activity,
    put_item,
    remove_assignment_to_collab,
    update_item,
)
from logger import logger
from models.General import (
    PatchCollabRoleServiceBodyRequest,
)
from models.Service import CollabRoleServicePayload
from utils import error_response

router = Router()


@router.post("/")
def assign_collab_to_role(service_code: str, role_hash: str, collab_id: str):
    try:
        body = CollabRoleServicePayload(**router.current_event.json_body)

        # check if service role exist
        if service_role := get_item(f"SERVICE#{service_code}", f"ROLES#{role_hash}"):
            required = service_role["required"]
            assigned = service_role["confirmed"] + service_role["proposed"]

            # check if allow more collabs in the role
            if assigned >= required:
                return error_response(
                    "AssignCollabToRoleError",
                    "No more collabs can be assigned to this role",
                )

            item = body.model_dump(exclude_none=True)
            item["serviceCode"] = service_code
            item["collabId"] = collab_id
            item["parentId"] = f"SERVICE#{service_code}"
            item["entityId"] = f"ROLES#{role_hash}"

            service = get_item("FAM#SERVICES", f"SERVICE#{service_code}")
            collab = get_item("FAM#COLLABS", f"COLLABS#{collab_id}")

            _ = add_assignment_to_collab(
                collab_id,
                {
                    "sk": f"SERVICE#{service_code}#ROLES#{role_hash}",
                    "serviceName": service["name"],
                },
            )

            item["collab"] = {
                "name": collab["name"],
                "roleName": collab["position"],
            }

            if "compliance" in collab:
                item["collab"]["compliance"] = collab["compliance"]
            if "annex" in collab:
                item["collab"]["annex"] = collab["annex"]

            _ = put_item(
                f"COLLABS#{collab_id}",
                f"SERVICE#{service_code}#ROLES#{role_hash}",
                item,
            )

            # update service role metric
            attribute = "confirmed" if body.status == "confirmado" else "proposed"

            _ = update_item(
                f"SERVICE#{service_code}",
                f"ROLES#{role_hash}",
                {f"{attribute}": service_role[attribute] + 1},
            )
            try:
                if user_sub := router.context.get("user_sub"):
                    log_activity(
                        user_sub,
                        "ASSIGN_SRV_COLLAB",
                        item,
                    )
            except Exception as err:
                logger.warning("LogError", str(err))
            return Response(
                status_code=201,
            )

        return error_response(
            "AssignCollabToRoleError",
            f"Service role doesn't exist. {service_code}. {role_hash}. {collab_id}",
        )

    except Exception as e:
        return error_response("PostRoleServiceError", str(e))


@router.patch("/")
def update_collab_assigned_to_role(service_code: str, role_hash: str, collab_id: str):
    try:
        body = PatchCollabRoleServiceBodyRequest(**router.current_event.json_body)
        item = body.model_dump(exclude_none=True, exclude={"collabId"})

        collab = get_item("FAM#COLLABS", f"COLLABS#{collab_id}")
        item["collab"] = {
            "name": collab["name"],
            "roleName": collab["position"],
        }
        if "shift" in collab:
            item["collab"]["shiftType"] = collab["shift"]["type"]
        if "compliance" in collab:
            item["collab"]["compliance"] = collab["compliance"]
        if "annex" in collab:
            item["collab"]["annex"] = collab["annex"]

        srv_collab = update_item(
            f"COLLABS#{collab_id}",
            f"SERVICE#{service_code}#ROLES#{role_hash}",
            item,
        )

        # update service role metric
        if body.status:
            if service_role := get_item(
                f"SERVICE#{service_code}", f"ROLES#{role_hash}"
            ):
                attribute = "confirmed" if body.status == "confirmado" else "proposed"
                attribute_old = (
                    "proposed" if body.status == "confirmado" else "confirmed"
                )
                _ = update_item(
                    f"SERVICE#{service_code}",
                    f"ROLES#{role_hash}",
                    {
                        f"{attribute}": service_role[attribute] + 1,
                        f"{attribute_old}": service_role[attribute_old] - 1,
                    },
                )
            else:
                logger.warning(
                    f"Service {service_code} with role {role_hash} not found"
                )

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(
                    user_sub,
                    "UPDATE_SRV_COLLAB",
                    srv_collab,
                )
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=200,
        )
    except Exception as e:
        return error_response("PatchRoleServiceError", str(e))


@router.delete("/")
def unassign_collab_to_role(service_code: str, role_hash: str, collab_id: str):
    try:
        if srv_collab := get_item(
            f"COLLABS#{collab_id}", f"SERVICE#{service_code}#ROLES#{role_hash}"
        ):
            _ = delete_item(
                f"COLLABS#{collab_id}",
                f"SERVICE#{service_code}#ROLES#{role_hash}",
            )

            collab = get_item("FAM#COLLABS", f"COLLABS#{collab_id}")
            if "assignments" in collab:
                if len(collab["assignments"]) > 0:
                    filtered_list = [
                        assignment
                        for assignment in collab["assignments"]
                        if assignment["serviceName"]
                        != f"SERVICE#{service_code}#ROLES#{role_hash}"
                    ]
                    _ = update_item(
                        "FAM#COLLABS",
                        f"COLLABS#{collab_id}",
                        {"assignments": filtered_list},
                    )
                else:
                    _ = remove_assignment_to_collab(collab_id)
            else:
                logger.warning(f"Assignment for Collab {collab_id} not found")

            if service_role := get_item(
                f"SERVICE#{service_code}", f"ROLES#{role_hash}"
            ):
                attribute = (
                    "confirmed" if srv_collab["status"] == "confirmado" else "proposed"
                )
                _ = update_item(
                    f"SERVICE#{service_code}",
                    f"ROLES#{role_hash}",
                    {
                        f"{attribute}": service_role[attribute] - 1,
                    },
                )
            else:
                logger.warning(
                    f"Service {service_code} with role {role_hash} not found"
                )

            try:
                if user_sub := router.context.get("user_sub"):
                    log_activity(
                        user_sub,
                        "UNASSIGN_SRV_COLLAB",
                        srv_collab,
                    )
            except Exception as err:
                logger.warning("LogError", str(err))
            return Response(
                status_code=200,
            )
        return error_response(
            "DeleteRoleServiceError",
            f"CollabServiceRole {collab_id} and SERVICE#{service_code}#ROLES#{role_hash} not found. Unassign impossible",
        )

    except Exception as e:
        return error_response("PatchRoleServiceError", str(e))
