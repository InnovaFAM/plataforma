from pydantic import BaseModel
from pydantic.fields import Field


class Structure(BaseModel):
    name: str | None = Field(description="Nombre del certificado", default=None)
    collab: str | None = Field(
        description="Nombre de la persona que recibe el certificado", default=None
    )
    createdAt: str | None = Field(
        description="Fecha de inicio del certificado", default=None
    )
    expiredAt: str | None = Field(
        description="Fecha de expiración del certificado", default=None
    )
    institution: str | None = Field(
        description="Nombre de la institución que emite el certificado", default=None
    )
    tags: list[str] | None = Field(
        description="Etiquetas de búsqueda del certificado", default=None
    )
    type: str | None = Field(
        description="Tipo de certificado, selecciona  uno de los types_certificates",
        default=None,
    )
    code: str | None = Field(
        description="Código del certificado, selecciona uno de los codes_certificates",
        default=None,
    )
    description: str | None = Field(
        description="Descripción de 500 caracteres del certificado", default=None
    )
