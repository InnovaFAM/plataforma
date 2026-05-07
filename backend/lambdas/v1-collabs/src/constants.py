import os

ENV = os.getenv("ENV", "stage")
REGION_NAME = os.getenv("REGION_NAME", "us-east-1")
TABLE_NAME = os.getenv("TABLE_NAME", f"CoreBusiness_{ENV}")
ACTIVITY_TABLE_NAME = os.getenv("ACTIVITY_TABLE_NAME", f"AuditLogs_{ENV}")
TEMPS_TABLE_NAME = os.getenv("TEMPS_TABLE_NAME", f"Temps_{ENV}")

FUNCTION_NAME = os.getenv("FUNCTION_NAME", f"v1-sync-buk-{ENV}")
EXPORT_LAMBDA_NAME = os.getenv("EXPORT_FUNCTION_NAME", f"innovafam-v1-exports-{ENV}")
