import os

ENV = os.getenv("ENV", "stage")
TABLE_NAME = f"CoreBusiness_{ENV}"

FUNCTION_NAME = os.getenv("FUNCTION_NAME", f"innovafam-v1-notifications-{ENV}")
