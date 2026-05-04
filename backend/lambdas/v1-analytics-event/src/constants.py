import os

ANALYTICS_TABLE_NAME = os.getenv("ANALYTICS_TABLE_NAME", "Analytics_stage")
CORE_TABLE_NAME = os.getenv("CORE_TABLE_NAME", "CoreBusiness_stage")
MAX_WORKERS = int(os.getenv("MAX_WORKERS", "8"))
