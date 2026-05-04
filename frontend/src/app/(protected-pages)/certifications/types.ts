export type TCertificate = {
    sk: string
    name: string
    code: string
    type: string
}

export type TRoleCertificateData = {
    sk: string
    name: string
}

export type TChoreCertificateData = {
    sk: string
    name: string
}

export type TRoleCertificateCreateBody = {
    certificate: string
    role: string
    assignedAt: string
    assignedBy: string
}

export type TChoreCertificateCreateBody = {
    certificate: string
    chore: string
    assignedAt: string
    assignedBy: string
}

export type TGlobalCertificationsResponse = {
    certificates: TCertificate[]
}

export type TRoleCertificationsResponse = {
    certificates: TCertificate[]
    roles: TRoleCertificateData[]
    matrix: Array<{ sk: string }>
}

export type TChoreCertificationsResponse = {
    certificates: TCertificate[]
    chores: TChoreCertificateData[]
    matrix: Array<{ sk: string }>
}
