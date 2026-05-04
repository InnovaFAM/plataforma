from pydantic.main import BaseModel


class CoreBusiness(BaseModel):
    pk: str
    sk: str
    parentId: str | None = None
    entityId: str | None = None


class Certificate(CoreBusiness):
    name: str
    code: str
    matrix: str
    relevance: str
    type: str
    updatedAt: str | None = None
    status: bool = True


class Temps(BaseModel):
    pk: str
    ttl: int


class TempCollabCertificate(Temps):
    name: str
    collabId: str
    type: str | None = None
    createdAt: str | None = None
    expiredAt: str | None = None
    institution: str | None = None
    tags: list[str] | None = None
    description: str | None = None
    code: str | None = None


class CollabCertificate(TempCollabCertificate, CoreBusiness):
    key: str
    status: bool = True
