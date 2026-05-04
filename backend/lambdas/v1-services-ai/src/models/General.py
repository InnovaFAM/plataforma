from typing import Any

from pydantic import BaseModel


class PaginatedResponse(BaseModel):
    items: list[dict[str, Any]]
    last_evaluated_key: str | None = None
