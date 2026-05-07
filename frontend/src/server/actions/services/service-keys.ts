export const serviceKeys = {
    listServices: (nextToken?: string) => ['services', nextToken] as const,
    serviceById: (id: string) => ['service', id] as const,
    rolesByServiceId: (serviceId: string) =>
        ['roles-by-service', serviceId] as const,
    serviceRoleAssignment: (serviceId: string, roleHash: string) =>
        ['collabs-roles-by-service', serviceId, roleHash] as const,
    deleteServiceRoleAssignment: (
        serviceId: string,
        roleHash: string,
        collabId: string,
    ) =>
        [
            'delete-collabs-roles-by-service',
            serviceId,
            roleHash,
            collabId,
        ] as const,
    updateserviceRoleAssignment: (serviceId: string, roleHash: string) =>
        ['update-collabs-roles-by-service', serviceId, roleHash] as const,
    updateClearanceCheckAssignment: (
        serviceId: string,
        roleHash: string,
        collabId: string,
    ) =>
        [
            'update-collabs-roles-by-service',
            collabId,
            serviceId,
            roleHash,
        ] as const,
}

export const serviceExportKeys = {
    service: (hash: string) => ['export-service', hash] as const,
    services: ['export-services'] as const,
}
