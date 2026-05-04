from pydantic.main import BaseModel


class CoreBusiness(BaseModel):
    pk: str
    sk: str
    parentId: str | None = None
    entityId: str | None = None
