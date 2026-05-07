from datetime import datetime, timedelta, timezone
from typing import Any

from aws.ddb import fetch_service_detail, get_all_items
from aws.s3 import create_download_url, upload_excel_to_s3
from aws.ses import send_export_email
from builds.collabs.index import build_collabs_excel, build_file_name
from builds.projects.index import build_projects_panel_excel
from builds.service_detail.index import build_service_detail_excel
from builds.services.index import build_services_excel
from constants import DEFAULT_TTL_SECONDS, EXPORT_BUCKET
from logger import logger
from utils import build_s3_key


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event: dict[str, Any], context):
    try:
        export_type = event.get("exportType", "COLLABS")
        requested_by = event.get("requestedBy") or {}
        filters = event.get("filters") or None

        to_email = requested_by.get("email")
        requester_name = requested_by.get("name") or "usuario"

        if not to_email:
            raise ValueError("requestedBy.email is required")

        if export_type == "COLLABS":
            items = get_all_items("FAM#COLLABS", search=filters)
            excel_bytes = build_collabs_excel(items)
            file_prefix = "colaboradores"
            folder = "collabs"
            email_label = "colaboradores"
        elif export_type == "SERVICES":
            items = get_all_items("FAM#SERVICES", search=filters)
            excel_bytes = build_services_excel(items)
            file_prefix = "servicios"
            folder = "services"
            email_label = "servicios"
        elif export_type == "SERVICE_DETAIL":
            service_code = (filters or {}).get("serviceCode")

            if not service_code:
                raise ValueError(
                    "filters.serviceCode is required for SERVICE_DETAIL export"
                )

            detail = fetch_service_detail(service_code=service_code)
            excel_bytes = build_service_detail_excel(detail)

            items = detail["assignments"]
            file_prefix = f"servicio_{service_code}"
            folder = "service-detail"
            email_label = f"detalle del servicio {service_code}"
        elif export_type == "PROJECTS_PANEL":
            report = event.get("data") or {}

            if not report:
                raise ValueError("data is required for PROJECTS_PANEL export")

            excel_bytes = build_projects_panel_excel(report)

            file_prefix = "panel_proyectos"
            folder = "projects-panel"
            email_label = "panel de proyectos"
            items = report.get("rolesTable", [])
        else:
            raise ValueError(f"Unsupported exportType: {export_type}")

        file_name = build_file_name(file_prefix)
        s3_key = build_s3_key(
            to_email=to_email,
            folder=folder,
            file_name=file_name,
        )

        expires_at = datetime.now(timezone.utc) + timedelta(seconds=DEFAULT_TTL_SECONDS)

        upload_excel_to_s3(
            key=s3_key,
            body=excel_bytes,
            file_name=file_name,
            expires_at=expires_at,
            export_type=export_type,
        )

        download_url = create_download_url(
            key=s3_key,
            file_name=file_name,
            expires_in=DEFAULT_TTL_SECONDS,
        )

        send_export_email(
            to_email=to_email,
            requester_name=requester_name,
            download_url=download_url,
            expires_at=expires_at,
            rows_count=len(items),
            email_label=email_label,
        )

        return {
            "ok": True,
            "exportType": export_type,
            "rows": len(items),
            "bucket": EXPORT_BUCKET,
            "key": s3_key,
            "expiresAt": expires_at.isoformat(),
        }
    except Exception as e:
        logger.exception(e)
        raise
