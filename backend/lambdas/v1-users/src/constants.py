import os

ENV = os.getenv("ENV", "stage")
REGION_NAME = os.getenv("REGION_NAME", "us-east-1")

TABLE_NAME = os.getenv("TABLE_NAME", "CoreBusiness_stage")
ACTIVITY_TABLE_NAME = os.getenv("ACTIVITY_TABLE_NAME", "AuditLogs_stage")


USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
