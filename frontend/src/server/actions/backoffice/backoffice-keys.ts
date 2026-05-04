export const backOfficeKeys = {
    clients: (nextToken?: string) => ['backoffice-clients', nextToken] as const,
    certifications: (nextToken?: string) =>
        ['backoffice-certifications', nextToken] as const,
    chores: (nextToken?: string) => ['backoffice-chores', nextToken] as const,
    divisions: (nextToken?: string) =>
        ['backoffice-divisions', nextToken] as const,
    holidays: (nextToken?: string) =>
        ['backoffice-holidays', nextToken] as const,
    roles: (nextToken?: string) => ['backoffice-roles', nextToken] as const,
    shifts: (nextToken?: string) => ['backoffice-shifts', nextToken] as const,
}
