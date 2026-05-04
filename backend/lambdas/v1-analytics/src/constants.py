import os

ENV = os.getenv("ENV", "stage")
REGION_NAME = os.getenv("REGION_NAME", "us-east-1")
TABLE_NAME = os.getenv("TABLE_NAME", "CoreBusiness_stage")
ANALYTICS_TABLE_NAME = os.getenv("ANALYTICS_TABLE_NAME", "Analytics_stage")
