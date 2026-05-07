import os

ENV = os.getenv("ENV", "stage")
REGION_NAME = os.getenv("REGION_NAME", "us-east-1")
TEMPS_TABLE_NAME = os.getenv("TEMPS_TABLE_NAME", f"Temps_{ENV}")
