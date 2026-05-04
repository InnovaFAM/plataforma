export const checkKeys = {
    certificate: (hash: string) => ['certificate-check', hash] as const,
    service: (hash: string) => ['service-check', hash] as const,
}
