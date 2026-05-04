from pydantic import BaseModel


class APIToken(BaseModel):
    pk: str
    expires: str
