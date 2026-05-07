import os

ENV = os.getenv("ENV", "stage")
ANALYTICS_TABLE_NAME = os.getenv("ANALYTICS_TABLE_NAME", f"Analytics_{ENV}")
CORE_TABLE_NAME = os.getenv("CORE_TABLE_NAME", f"CoreBusiness_{ENV}")
MAX_WORKERS = int(os.getenv("MAX_WORKERS", "8"))
