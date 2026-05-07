import os

ENV = os.getenv("ENV", "stage")
REGION_NAME = os.getenv("REGION_NAME", "us-east-1")
TABLE_NAME = os.getenv("TABLE_NAME", f"CoreBusiness_{ENV}")
ACTIVITY_TABLE_NAME = os.getenv("ACTIVITY_TABLE_NAME", f"AuditLogs_{ENV}")
