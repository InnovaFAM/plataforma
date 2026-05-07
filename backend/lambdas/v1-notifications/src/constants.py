import os

ENV = os.getenv("ENV", "stage")
FROM_EMAIL = os.getenv("FROM_EMAIL", "soporte@innovafam.cl")
TABLE_NAME = f"CoreBusiness_{ENV}"
