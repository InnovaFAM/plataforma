from aws import query_roles_by_service
from hh._utils import calculate_role_person_hours_in_month

roles = query_roles_by_service("SV-1001")
sample_role = roles[0]

print(
    {
        "sample_role": sample_role,
        "calculated_april": calculate_role_person_hours_in_month(
            sample_role, "2026-04"
        ),
        "calculated_may": calculate_role_person_hours_in_month(sample_role, "2026-05"),
    }
)
