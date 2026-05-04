import json
import os
from pathlib import Path

import requests
from requests import Response
from requests.exceptions import RequestException

BASE_URL = os.getenv(
    "BASE_URL",
    "https://pkdzgs9mbl.execute-api.us-east-1.amazonaws.com/innovafam-v1-stage",
)
JSON_FILE_PATH = os.getenv(
    "JSON_FILE_PATH",
    "/Users/patcornejo/Projects/innovafam/helpers/collab_role_service_assignments_dummy_v2.json",
)
AUTH_TOKEN = os.getenv(
    "AUTH_TOKEN",
    "eyJraWQiOiIwb1dTTzIyWCtjdjljcFo1QjhqODE1YStRRHl3K3luZnkrUDhGcDlvZGljPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkNDM4NDQzOC1jMGQxLTcwZmYtZjliMC0yMTRkNjcxZDFiZDAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9vWkEzUHM2ZUgiLCJjbGllbnRfaWQiOiIzdTQ1dGF0MmZqMHEzcGxwMXYzaTYwZDZ1ZyIsIm9yaWdpbl9qdGkiOiJkMGQ5YTNiMy04NmIxLTQ1ZTAtOWFmYy1hNzRjMzQwMTBhZjUiLCJldmVudF9pZCI6ImIyNGNiZWFiLTAxNGMtNDMwZi04NzY4LTkyZTQ2MjU1MDNlYSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3Nzc1NDA1ODcsImV4cCI6MTc3NzU3NjU4NywiaWF0IjoxNzc3NTQwNTg3LCJqdGkiOiJlZjY3ZGFlYS1mMjliLTRhYmItODhhNi01YTdkNzJmOWNhNDgiLCJ1c2VybmFtZSI6ImQ0Mzg0NDM4LWMwZDEtNzBmZi1mOWIwLTIxNGQ2NzFkMWJkMCJ9.l87lbfzqcZY_SYhRJxyE5nj12kQoT-jkUu8vNNCvhslVdosCkCRSu88sR57119uM4xz5XX6ivScLgKPNMmtirfwUqx9hoXX6IMwiF9PJJFJ1DT7J0HFHsOgwdmoOYlkJ9hCFaQkXhnX7Jvbhm-2FggLrEF9o1uoogFK0y2-5Oi_oH0OeDBZg2n_YDd7RCE5BI-_MK74oYb7rfSOOEsn_-ztnln8CETUo1kH6BBVLwnLFrO6fPHgMd9Hg1bXQO_EkywLzNliue3AIjtum9xwMzOpLiPR9uwpu9MoE8_D0bdaER1KPLw_U4ifFekj_jMwsL-YuHYxeB6rabQDHyqPtwQ",
)
TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SECONDS", "30"))
DRY_RUN = os.getenv("DRY_RUN", "false").lower() == "true"


def load_assignments(file_path: str) -> list[dict]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Assignments file not found: {file_path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Expected a JSON array at the root")

    return data


def extract_service_code(parent_id: str) -> str:
    # parentId = SERVICES#SV-1001
    return parent_id.replace("SERVICES#", "", 1)


def extract_role_hash(entity_id: str) -> str:
    # entityId = ROLES#G1Z6KiBUGLAA
    return entity_id.replace("ROLES#", "", 1)


def build_request(item: dict) -> tuple[str, dict]:
    service_code = item.get("serviceCode") or extract_service_code(item["parentId"])
    role_hash = extract_role_hash(item["entityId"])
    collab_id = item.get("collabId")

    url = f"{BASE_URL}/services/{service_code}/roles/{role_hash}/collabs/{collab_id}"

    body = {
        "roleName": item["roleName"],
        "startedAt": item["startedAt"],
        "endedAt": item["endedAt"],
        "status": item["status"],
    }

    return url, body


def build_headers() -> dict[str, str]:
    headers = {
        "Content-Type": "application/json",
    }

    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"

    return headers


def send_assignment(url: str, body: dict, headers: dict[str, str]) -> Response:

    return requests.post(
        url,
        json=body,
        headers=headers,
        timeout=TIMEOUT_SECONDS,
    )


def main():
    assignments = load_assignments(JSON_FILE_PATH)
    headers = build_headers()

    success_count = 0
    error_count = 0

    for index, item in enumerate(assignments, start=1):
        url, body = build_request(item)

        if DRY_RUN:
            print(f"[DRY_RUN] #{index} POST {url}")
            print(body)
            continue

        try:
            response = send_assignment(url, body, headers)

            if 200 <= response.status_code < 300:
                success_count += 1
                print(
                    f"[OK] #{index} service={item.get('serviceCode')} "
                    f"role={item.get('entityId')} collab={item.get('collabId')} "
                    f"status={item.get('status')}"
                )
            else:
                error_count += 1
                print(
                    f"[ERROR] #{index} status_code={response.status_code} "
                    f"service={item.get('serviceCode')} role={item.get('entityId')} "
                    f"collab={item.get('collabId')} response={response.text}"
                )

        except RequestException as e:
            error_count += 1
            print(
                f"[ERROR] #{index} service={item.get('serviceCode')} "
                f"role={item.get('entityId')} collab={item.get('collabId')} "
                f"message={str(e)}"
            )

    if DRY_RUN:
        print(f"\nDry run completed. Items inspected: {len(assignments)}")
    else:
        print(f"\nCompleted. Success: {success_count} | Errors: {error_count}")


if __name__ == "__main__":
    main()
