from datetime import datetime
from typing import Any

from aws_lambda_powertools.event_handler.api_gateway import Response, Router

from aws.ddb import (
    delete_item,
    get_all_items_by_role,
    get_item,
    get_matrix_certificate_by_role,
    get_paginated_items,
    get_role_by_name,
    get_temp,
    log_activity,
    put_item,
    put_temp,
    query_collabs,
)
from aws.lbda import invoke_export_collabs, invoke_sync_collabs
from logger import logger
from models.FAM import (
    Certificate,
    Collab,
    CollabCertificatePayload,
    CollabEvaluationPayload,
    CollabRoleService,
)
from models.General import PostRoleBodyRequest
from process import parse_certificate_compliance, parse_collab_role
from utils import (
    error_response,
    generate_unique_hash,
    get_24_hours_from_now,
    is_collab_available,
)

router = Router()
pk = "FAM#COLLABS"


@router.post("/by/role")
def get_collabs_by_role():
    try:
        body = PostRoleBodyRequest(**router.current_event.json_body)
        collabs = get_all_items_by_role(
            pk,
            search={"position": body.roleName},
            names=[
                "sk",
                "status",
                "name",
                "email",
                "position",
                "annex",
                "assignments",
                "compliance",
                "pictureUrl",
            ],
        )

        items: list[dict[str, Any]] = []

        global_certificates = get_all_items_by_role(
            "FAM#CERTS", search={"matrix": "Global"}, names=["code"]
        )

        certificates_by_role = get_all_items_by_role(
            "CERTS#ROLES", search={"role": body.roleName}, names=["certificate"]
        )

        certificates_by_chore = get_all_items_by_role(
            "CERTS#CHORES", search={"role": body.roleName}, names=["certificate"]
        )

        len_global_certificates = len(global_certificates)
        len_certificates_by_role = len(certificates_by_role)
        len_certificates_by_chore = len(certificates_by_chore)

        for collab in collabs:
            item = parse_collab_role(collab, body)
            item["compliance"] = parse_certificate_compliance(
                collab,
                global_certificates,
                certificates_by_role,
                certificates_by_chore,
                len_global_certificates,
                len_certificates_by_role,
                len_certificates_by_chore,
            )

            items.append(item)
        return {"items": items, "length": len(collabs)}
    except Exception as e:
        return error_response("GetCollabsByRoleError", str(e))


@router.get("")
def get_collabs():
    try:
        next_key = router.current_event.get_query_string_value(
            name="nextKey", default_value=None
        )
        page_size = router.current_event.get_query_string_value(
            name="pageSize", default_value="10"
        )

        response = get_paginated_items(
            pk,
            start_key=next_key,
            page_size=int(page_size),
            names=[
                "sk",
                "status",
                "name",
                "position",
                "assignments",
                "address",
                "pictureUrl",
            ],
        )

        return response.model_dump_json(exclude_none=True)
    except Exception as e:
        return error_response("GetCollabsError", str(e))


@router.get("/export")
def export_collabs():
    try:
        if user_sub := router.context.get("user_sub"):
            invoke_export_collabs(user_sub)
            return Response(
                status_code=202,
                body="collabs exported successfully",
            )
        else:
            return error_response("ExportCollabsError", "User sub not found")
    except (Exception, ValueError) as e:
        return error_response("ExportCollabsError", str(e))


@router.get("/sync")
def sync_collabs():
    try:
        if temp := get_temp("Temps#SyncCollabs"):
            return error_response(
                "SyncCollabsError", "Sólo se puede sincronizar una vez al día"
            )

        invoke_sync_collabs("full")
        _ = put_temp("Temps#SyncCollabs", {"ttl": get_24_hours_from_now()})
        return Response(
            status_code=202,
            body="Sync successful",
        )
    except Exception as e:
        return error_response("SyncCollabsError", str(e))


@router.get("/<collab_id>/sync")
def sync_collab(collab_id: str):
    try:
        invoke_sync_collabs("update", collab_id)
        return Response(
            status_code=202,
            body="Sync successful",
        )
    except Exception as e:
        return error_response("SyncCollabError", str(e))


@router.post("/<collab_id>/role")
def get_collab_role_by_id(collab_id: str):
    try:
        body = PostRoleBodyRequest(**router.current_event.json_body)
        if collab_dict := get_item("FAM#COLLABS", f"COLLABS#{collab_id}"):
            global_certificates = get_all_items_by_role(
                "FAM#CERTS", search={"matrix": "Global"}, names=["code"]
            )

            certificates_by_role = get_all_items_by_role(
                "CERTS#ROLES", search={"role": body.roleName}, names=["certificate"]
            )

            certificates_by_chore = get_all_items_by_role(
                "CERTS#CHORES", search={"role": body.roleName}, names=["certificate"]
            )

            len_global_certificates = len(global_certificates)
            len_certificates_by_role = len(certificates_by_role)
            len_certificates_by_chore = len(certificates_by_chore)

            item = parse_collab_role(collab_dict, body)
            item["compliance"] = parse_certificate_compliance(
                collab_dict,
                global_certificates,
                certificates_by_role,
                certificates_by_chore,
                len_global_certificates,
                len_certificates_by_role,
                len_certificates_by_chore,
            )

            return item
        else:
            return error_response(
                "GetCollabRoleError", f"Collab with id {collab_id} not found"
            )
    except Exception as e:
        return error_response("GetCollabRoleError", str(e))


@router.get("/<collab_id>")
def get_collab_by_id(collab_id: str):
    try:
        if item := get_item(pk, f"COLLABS#{collab_id}"):
            collab = Collab(**item)
            collab_json = collab.model_dump(exclude_none=True)

            # check assginents
            if collab.assignments:
                for assignment in enumerate(collab.assignments):
                    if assignment_dict := get_item(collab.sk, assignment[1].sk):
                        collab_json["assignments"][assignment[0]] = {
                            "serviceName": assignment[1].serviceName,
                            "serviceSk": assignment_dict.get("parentId", ""),
                            "roleName": assignment_dict.get("roleName", ""),
                            "endedAt": assignment_dict.get("endedAt", ""),
                            "startedAt": assignment_dict.get("startedAt", ""),
                            "status": assignment_dict.get("status", ""),
                        }

            # check certificates compliance
            # get required certificates by role sk
            certificates_required: list[Certificate] = []
            if role := get_role_by_name(collab.position):
                role_sk = role["sk"].split("#")[1]
                if required_cert := get_matrix_certificate_by_role(role_sk):
                    if certificate := get_item(
                        "FAM#CERTS", f"CERTS#{required_cert.certificate}"
                    ):
                        certificates_required.append(Certificate(**certificate))
                    else:
                        logger.warning(
                            f"Certificate not found: CERTS#{required_cert.certificate}"
                        )
                else:
                    logger.warning(f"No matrix certificate found for role: {role_sk}")
            else:
                logger.warning(f"No role found for position: {collab.position}")

            global_certs = get_all_items_by_role(
                "FAM#CERTS", search={"matrix": "Global"}
            )
            for cert in global_certs:
                certificates_required.append(Certificate(**cert))
            collab_certificates = query_collabs(
                f"COLLABS#{collab_id}",
                begin_with="CERTS",
                names=[
                    "createdAt",
                    "expiredAt",
                    "institution",
                    "sk",
                    "code",
                    "type",
                    "name",
                    "status",
                    "key",
                    "description",
                ],
            )
            len_certifcates_required = len(certificates_required)
            count_certificates_done = 0
            cert_code_list = [cert.code for cert in certificates_required]
            for cert in collab_certificates:
                if cert["code"] in cert_code_list:
                    _ = certificates_required.pop(cert_code_list.index(cert["code"]))
                    count_certificates_done += 1
            collab_json["compliance"] = (
                count_certificates_done / len_certifcates_required
            )

            collab_evaluations = query_collabs(
                f"COLLABS#{collab_id}",
                begin_with="EVALS",
                names=[
                    "createdBy",
                    "createdAt",
                    "sk",
                    "type",
                    "service",
                    "categories",
                    "result",
                ],
            )

            return {
                **collab_json,
                "certificates": {
                    "uploaded": collab_certificates,
                    "to_upload": certificates_required,
                },
                "evaluations": collab_evaluations,
            }
        return error_response(
            "GetCollabByIDError", f"Collab with id {collab_id} not found"
        )

    except Exception as e:
        return error_response("GetCollabByIDError", str(e))


@router.post("/<collab_id>/certificates")
def create_collab_certificate(collab_id: str):
    try:
        body = CollabCertificatePayload(**router.current_event.json_body)
        cc = body.model_dump(exclude_none=True)
        cc["parentId"] = "COLLABS#CERTS"
        hash = generate_unique_hash()
        _ = put_item(
            f"COLLABS#{collab_id}",
            f"CERTS#{hash}",
            cc,
        )

        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(
                    user_sub, "ADD_COLLAB_CERT", {"collab_id": collab_id, **cc}
                )
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=201,
            body="certificate created successfully",
        )
    except Exception as e:
        return error_response("PostCollabCertificateError", str(e))


@router.delete("/<collab_id>/certificates/<hash>")
def delete_collab_certificate(collab_id: str, hash: str):
    try:
        if cc := get_item(f"COLLABS#{collab_id}", f"CERTS#{hash}"):
            _ = delete_item(
                f"COLLABS#{collab_id}",
                f"CERTS#{hash}",
            )

            try:
                if user_sub := router.context.get("user_sub"):
                    log_activity(user_sub, "DEL_COLLAB_CERT", cc)
            except Exception as err:
                logger.warning("LogError", str(err))

            return Response(
                status_code=204,
                body="certificate deleted successfully",
            )

        return error_response(
            "DeleteCollabCertificateError",
            f"Certificado no existe para colaborador {collab_id}",
        )

    except Exception as e:
        return error_response("DeleteCollabCertificateError", str(e))


@router.get("/<collab_id>/evaluations/<hash>")
def get_collab_evaluation_by_hash(collab_id: str, hash: str):
    try:
        if item := get_item(f"COLLABS#{collab_id}", f"EVALS#{hash}"):
            return item
        return error_response(
            "GetCollabEvaluationByHashError",
            f"CollabEvaluation for {collab_id} and hash {hash} not found",
        )

    except Exception as e:
        return error_response("GetCollabEvaluationByHashError", str(e))


@router.post("/<collab_id>/evaluations")
def create_collab_evaluation(collab_id: str):
    try:
        body = CollabEvaluationPayload(**router.current_event.json_body)
        ce = body.model_dump(exclude_none=True)
        ce["parentId"] = "COLLABS#CERTS"
        hash = generate_unique_hash()
        _ = put_item(
            f"COLLABS#{collab_id}",
            f"EVALS#{hash}",
            ce,
        )
        try:
            if user_sub := router.context.get("user_sub"):
                log_activity(user_sub, "CREATE_EVALUATION", ce)
        except Exception as err:
            logger.warning("LogError", str(err))
        return Response(
            status_code=201,
            body="evaluation created successfully",
        )
    except Exception as e:
        return error_response("PostCollabEvaluationError", str(e))


@router.delete("/<collab_id>/evaluations/<hash>")
def delete_collab_evaluation(collab_id: str, hash: str):
    try:
        if ce := get_item(f"COLLABS#{collab_id}", f"EVALS#{hash}"):
            _ = delete_item(
                f"COLLABS#{collab_id}",
                f"EVALS#{hash}",
            )
            try:
                if user_sub := router.context.get("user_sub"):
                    log_activity(user_sub, "DEL_EVALUATION", ce)
            except Exception as err:
                logger.warning("LogError", str(err))
            return Response(
                status_code=204,
                body="evaluation deleted successfully",
            )

        return error_response(
            "DeleteCollabEvaluationError",
            f"Evaluación no existe para colaborador {collab_id}",
        )
    except Exception as e:
        return error_response("DeleteCollabEvaluationError", str(e))
