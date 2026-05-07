import os

ENV = os.getenv("ENV", "stage")
REGION_NAME = os.getenv("REGION_NAME", "us-east-1")

FUNCTION_NAME = os.getenv("FUNCTION_NAME", f"innovafam-v1-notifications-{ENV}")
EXPORT_LAMBDA_NAME = os.getenv("EXPORT_FUNCTION_NAME", f"innovafam-v1-exports-{ENV}")
TABLE_NAME = f"CoreBusiness_{ENV}"
ACTIVITY_TABLE_NAME = f"AuditLogs_{ENV}"
