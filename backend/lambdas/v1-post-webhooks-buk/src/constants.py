import os

ENV = os.environ.get("ENV", "stage")
REGION_NAME = os.environ.get("REGION_NAME", "us-east-1")
FAM_BUK_URL = os.environ.get("FAM_BUK_URL", "https://fam.buk.cl/api/v1/chile")
TABLE_NAME = os.environ.get("TABLE_NAME", f"CoreBusiness_{ENV}")
BUK_API_KEY = os.environ.get("BUK_API_KEY", "")

FUNCTION_NAME = os.getenv("FUNCTION_NAME", f"innovafam-v1-notifications-{ENV}")
