import os

ENV = os.getenv("ENV", "stage")

TEMPS_TABLE_NAME = os.getenv("TEMPS_TABLE_NAME", f"Temps_{ENV}")
TABLE_NAME = os.getenv("TABLE_NAME", f"CoreBusiness_{ENV}")
ACTIVITY_TABLE_NAME = os.getenv("ACTIVITY_TABLE_NAME", f"AuditLogs_{ENV}")

AWS_REGION_NAME = os.getenv("AWS_REGION_NAME", "us-east-1")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", f"innovafam-{ENV}")
AWS_MODEL_ARN = os.getenv(
    "AWS_MODEL_ARN",
    f"arn:aws:bedrock:{AWS_REGION_NAME}:683953625718:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0",
)
