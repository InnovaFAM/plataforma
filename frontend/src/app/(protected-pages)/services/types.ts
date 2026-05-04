export type Collab = {
    name: string
    img: string
}

export type Filter = {
    minDate?: string
    maxDate?: string
    client?: string
    faena?: string
    status?: string[]
}

export type RoleAssignmentFilter = {
    status?: string
    evaluation?: string
    compliance?: string
    annexes?: string
}
export type Activity = {
    date: number
    events: {
        time: number
        action: string
        recipient?: string
    }[]
}

export type Activities = Activity[]

export type MemberListOption = {
    value: string
    label: string
    img: string
}

export type TClient = {
    name: string
    rut: string
    sk: string
}

export type TChore = {
    name: string
    code: string
    sk: string
}

export type TDivision = {
    name: string
    number: string
    sk: string
}

export type TContractManager = {
    name: string
    phoneNumber?: string
    role: string
    type: 'cliente' | 'fam'
    email: string
    img?: string
}

export type TSubContractManager = {
    contractManagers: TContractManager[]
    companyName: string
    startDate: string
    endDate: string
    status: string
    [key: string]: unknown
}

export type TServiceStatus = 'boceto' | 'publicado'

export type TService = {
    pk: string
    sk: string
    chore: TChore
    code: string
    managers: TContractManager[]
    name: string
    division: TDivision
    parentId: string
    client?: TClient
    status?: TServiceStatus
    startDate?: string
    roles?: TServiceRole[]
    ttl?: string
    priority?: string
    endDate?: string
}

export type TDetailedService = TService & {
    contractNumber: string
    submanagers: TSubContractManager[]
}

export type TServiceRole = {
    pk: string
    sk: string
    confirmed: string
    required: string
    hoursPerDay: number
    shiftType: string
    weeklyHours: number
    proposed: string
    roleName: string
    startedAt: string
    endedAt: string
}

export type TServiceRoleTemp = Pick<
    TServiceRole,
    'roleName' | 'sk' | 'startedAt' | 'endedAt' | 'required'
>

export type TServiceRoleCreatePayload = Pick<
    TServiceRole,
    'required' | 'roleName' | 'endedAt' | 'startedAt'
>

export type TServiceRoleAssignment = {
    pk: string
    sk: string
    parentId: string
    entityId: string
    roleName: string
    collabId: string
    serviceCode: string
    startedAt: string
    endedAt: string
    status: 'propuesto' | 'confirmado'
    clearance?: boolean
}

export type TServiceRoleAssignmentUpdatePayload = {
    startedAt?: string
    endedAt?: string
    clearance?: boolean
    status?: 'propuesto' | 'confirmado'
}
