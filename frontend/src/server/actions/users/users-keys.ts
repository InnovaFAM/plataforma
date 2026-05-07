export const usersKeys = {
    all: () => ['users'] as const,
    data: ['data'] as const,
    update: (userId: string) => ['users', 'update', userId] as const,
    list: (nextToken?: string) => ['users', 'list', nextToken] as const,
}

export const rolesKeys = {
    all: ['roles'] as const,
}

export const activitiesKeys = {
    all: () => ['activities'] as const,
    list: (nextToken?: string) => ['activities', 'list', nextToken] as const,
}

export const notificationsKeys = {
    all: () => ['notifications'] as const,
    list: (nextToken?: string) => ['notifications', 'list', nextToken] as const,
}
