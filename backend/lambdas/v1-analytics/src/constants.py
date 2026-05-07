import os

ENV = os.getenv("ENV", "stage")
REGION_NAME = os.getenv("REGION_NAME", "us-east-1")
TABLE_NAME = os.getenv("TABLE_NAME", f"CoreBusiness_{ENV}")
ANALYTICS_TABLE_NAME = os.getenv("ANALYTICS_TABLE_NAME", f"Analytics_{ENV}")

EXPORT_LAMBDA_NAME = os.getenv("EXPORT_FUNCTION_NAME", f"innovafam-v1-exports-{ENV}")
