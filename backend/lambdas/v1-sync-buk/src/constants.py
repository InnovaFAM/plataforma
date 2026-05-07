import os

ENV = os.environ.get("ENV", "stage")
FAM_BUK_URL = os.environ.get("FAM_BUK_URL", "https://fam.buk.cl/api/v1/chile")
TABLE_NAME = os.environ.get("TABLE_NAME", f"CoreBusiness_{ENV}")
BUK_API_KEY = os.environ.get("BUK_API_KEY", "")
