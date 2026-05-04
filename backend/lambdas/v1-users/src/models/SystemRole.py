from models.CoreBusiness import CoreBusiness


class SystemRole(CoreBusiness):
    description: str
    name: str
    permissions: list[dict[str, str]]
