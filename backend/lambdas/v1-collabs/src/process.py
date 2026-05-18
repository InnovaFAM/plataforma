from datetime import datetime

from typing_extensions import Any

from aws.ddb import get_item, query_collabs
from models.FAM import CollabRoleService
from models.General import PostRoleBodyRequest
from utils import is_collab_available


def parse_collab_role(
    collab: dict[str, Any], body: PostRoleBodyRequest
) -> dict[str, Any]:
    item: dict[str, Any] = {
        "status": "disponible",
        "annex": True if collab.get("annex") else False,
        "name": collab["name"],
        "email": collab["email"],
        "sk": collab["sk"],
        "pictureUrl": collab.get("pictureUrl", ""),
    }
    if it := get_item(collab["sk"], f"{body.pk}#{body.sk}"):
        collab_role_service = CollabRoleService(**it)
        item["status"] = collab_role_service.status
        item["startedAt"] = (
            datetime.fromisoformat(collab_role_service.startedAt)
            .replace(tzinfo=None)
            .strftime("%d/%m/%Y")
        )
        item["endedAt"] = (
            datetime.fromisoformat(collab_role_service.endedAt)
            .replace(tzinfo=None)
            .strftime("%d/%m/%Y")
        )
        item["clearance"] = collab_role_service.clearance
    else:
        if collab.get("assignments"):
            is_available = False
            for assignment in collab["assignments"]:
                if assign := get_item(collab["sk"], assignment["sk"]):
                    collab_role_service = CollabRoleService(**assign)
                    is_available = is_collab_available(
                        collab_role_service.startedAt,
                        collab_role_service.endedAt,
                        body.startedAt,
                        body.endedAt,
                    )
                    if not is_available:
                        item["status"] = "no disponible"
                        break

    # check evaluations
    collab_evaluations = query_collabs(
        collab["sk"],
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
    len_collab_evaluations = len(collab_evaluations)
    if len_collab_evaluations > 0:
        item["evaluations"] = sum(
            [evaluation["result"] for evaluation in collab_evaluations]
        ) / (len_collab_evaluations if len_collab_evaluations > 0 else 1)
    else:
        item["evaluations"] = 0

    return item


def parse_certificate_compliance(
    collab: dict[str, Any],
    global_certificates: list[dict[str, Any]],
    certificates_by_role: list[dict[str, Any]],
    certificates_by_chore: list[dict[str, Any]],
    len_global_certificates: int,
    len_certificates_by_role: int,
    len_certificates_by_chore: int,
) -> float:

    # check collab global compliance
    global_compliance = 0
    if len_global_certificates > 0:
        for global_certificate in global_certificates:
            if cert_role := get_item(
                collab["sk"], f"CERTS#{global_certificate['code']}"
            ):
                global_compliance += 1

    # check collab compliance by role
    role_compliance = 0
    if len_certificates_by_role > 0:
        for certificate_by_role in certificates_by_role:
            if cert_role := get_item(
                collab["sk"], f"CERTS#{certificate_by_role['certificate']}"
            ):
                role_compliance += 1

    # check collab compliance by chore
    chore_compliance = 0
    if len_certificates_by_chore > 0:
        for certificate_by_chore in certificates_by_chore:
            if cert_role := get_item(
                collab["sk"], f"CERTS#{certificate_by_chore['certificate']}"
            ):
                chore_compliance += 1

    # calculate total compliance
    per_global_compliance = (
        (global_compliance / len_global_certificates)
        if len_global_certificates > 0
        else 1
    )
    per_certificates_by_role = (
        (role_compliance / len_certificates_by_role)
        if len_certificates_by_role > 0
        else 1
    )
    per_certificates_by_chore = (
        (chore_compliance / len_certificates_by_chore)
        if len_certificates_by_chore > 0
        else 1
    )
    return (
        per_global_compliance + per_certificates_by_role + per_certificates_by_chore
    ) / 3
