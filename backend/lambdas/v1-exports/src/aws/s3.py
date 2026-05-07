from datetime import datetime

import boto3

from constants import EXPORT_BUCKET

s3 = boto3.client("s3")


def upload_excel_to_s3(
    key: str,
    body: bytes,
    file_name: str,
    expires_at: datetime,
    export_type: str,
) -> None:
    s3.put_object(
        Bucket=EXPORT_BUCKET,
        Key=key,
        Body=body,
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ContentDisposition=f'attachment; filename="{file_name}"',
        ServerSideEncryption="AES256",
        Metadata={
            "expires-at": expires_at.isoformat(),
            "export-type": export_type,
        },
    )


def create_download_url(
    key: str,
    file_name: str,
    expires_in: int,
) -> str:
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": EXPORT_BUCKET,
            "Key": key,
            "ResponseContentDisposition": f'attachment; filename="{file_name}"',
        },
        ExpiresIn=expires_in,
    )
