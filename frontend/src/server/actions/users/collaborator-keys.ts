export const collaboratorKeys = {
    singleCollaborator: (id: string) => ['collaborator', id] as const,
}

export const collaboratorsKeys = {
    all: ['collaborators'] as const,
    list: (nextToken?: string) => ['collaborators', 'list', nextToken] as const,
}

export const certificateKeys = {
    status: (hash: string) => ['certificate-status', hash] as const,
}
