import { PaginatedResponse } from '@/@types'

export type TMatrix = 'Cargo' | 'Faena' | 'Global'
export type TRelevance = '30' | '60' | '-1'
export type THolidayType = 'auto' | 'manual'

export type TBackOfficeCertificate = {
    pk: string
    sk: string
    name: string
    code: string
    type: string
    relevance: TRelevance
    matrix: TMatrix
}

export type TBackOfficeCertificateCreate = {
    name: string
    code: string
    type: string
    relevance: TRelevance
    matrix: TMatrix
}

export type TBackOfficeCertificateUpdate = {
    sk: string
    name?: string
    code?: string
    type?: string
    relevance: TRelevance
    matrix?: TMatrix
}

export type TBackOfficeClient = {
    pk: string
    sk: string
    name: string
    rut: string
}

export type TBackOfficeClientCreate = Omit<TBackOfficeClient, 'pk' | 'sk'>

export type TBackOfficeClientUpdate = {
    sk: string
    name?: string
}

export type TBackOfficeDivision = {
    pk: string
    sk: string
    name: string
    number: string
}

export type TBackOfficeDivisionCreate = {
    name: string
    number: string
}

export type TBackOfficeDivisionUpdate = {
    sk: string
    name?: string
    number?: string
}

export type TBackOfficeHoliday = {
    pk: string
    sk: string
    date: string
    type: THolidayType
}

export type TBackOfficeHolidayCreate = Omit<TBackOfficeHoliday, 'pk' | 'sk'>

export type TBackOfficeHolidayUpdate = {
    sk: string
    date?: string
    type?: THolidayType
}

export type TBackOfficeRole = {
    pk: string
    sk: string
    shiftType: string
    hoursPerDay: number
    weeklyHours: number
    name: string
}

export type TBackOfficeRoleCreate = Omit<TBackOfficeRole, 'pk' | 'sk'>

export type TBackOfficeRoleUpdate = {
    sk: string
    name?: string
    shiftType?: string
    hoursPerDay?: number
    weeklyHours?: number
}

export type TBackOfficeChore = {
    pk: string
    sk: string
    name: string
    code: string
}

export type TBackOfficeChoreCreate = {
    name: string
    code: string
}

export type TBackOfficeChoreUpdate = {
    sk: string
    name?: string
    code?: string
}

export type TBackOfficeShiftData = {
    hoursPerDay: number
    shiftType?: string
    weeklyHours: number
}

export type TBackOfficeShift = {
    pk: string
    sk: string
    name: string
    type: string
    data: TBackOfficeShiftData
    distribution: string
}

export type TBackOfficeShiftCreate = Pick<
    TBackOfficeShift,
    'name' | 'type' | 'distribution' | 'data'
>

export type TBackOfficeShiftUpdate = {
    sk: string
    name?: string
    type?: string
    data?: TBackOfficeShiftData
    distribution?: string
}

export type TBackOfficeData = {
    clients: PaginatedResponse<TBackOfficeClient>
    certifications: PaginatedResponse<TBackOfficeCertificate>
    chores: PaginatedResponse<TBackOfficeChore>
    divisions: PaginatedResponse<TBackOfficeDivision>
    holidays: PaginatedResponse<TBackOfficeHoliday>
    roles: PaginatedResponse<TBackOfficeRole>
    shifts: PaginatedResponse<TBackOfficeShift>
}
