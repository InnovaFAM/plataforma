from pydantic import BaseModel


class DeleteBodyRequest(BaseModel):
    pk: str
    sk: str
