from datetime import datetime, timezone
from html import escape

import boto3

from constants import FROM_EMAIL

ses = boto3.client("sesv2")


def send_export_email(
    to_email: str,
    requester_name: str,
    download_url: str,
    expires_at: datetime,
    rows_count: int,
    email_label: str,
) -> None:
    expires_at_text = expires_at.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    subject = f"Tu exportación de {email_label} está lista"

    text_body = f"""
Hola {requester_name},

Tu exportación de {email_label} está lista.

Registros exportados: {rows_count}
El enlace estará disponible hasta: {expires_at_text}

Descargar archivo:
{download_url}

Saludos.
""".strip()

    html_body = f"""
<html>
  <body style="font-family: Arial, sans-serif; color: #111827;">
    <p>Hola {escape(requester_name)},</p>

    <p>Tu exportación de {escape(email_label)} está lista.</p>

    <p>
      <strong>Registros exportados:</strong> {rows_count}<br />
      <strong>Disponible hasta:</strong> {escape(expires_at_text)}
    </p>

    <p>
      <a href="{escape(download_url, quote=True)}"
         style="display:inline-block;padding:10px 16px;background:#1F4E78;color:#ffffff;text-decoration:none;border-radius:6px;">
        Descargar Excel
      </a>
    </p>

    <p style="font-size:12px;color:#6B7280;">
      Por seguridad, este enlace expirará automáticamente.
    </p>
  </body>
</html>
""".strip()

    ses.send_email(
        FromEmailAddress=FROM_EMAIL,
        Destination={
            "ToAddresses": [to_email],
        },
        Content={
            "Simple": {
                "Subject": {
                    "Data": subject,
                    "Charset": "UTF-8",
                },
                "Body": {
                    "Text": {
                        "Data": text_body,
                        "Charset": "UTF-8",
                    },
                    "Html": {
                        "Data": html_body,
                        "Charset": "UTF-8",
                    },
                },
            }
        },
    )
