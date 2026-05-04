from pydantic import BaseModel


class Base(BaseModel):
    pk: str
    sk: str
