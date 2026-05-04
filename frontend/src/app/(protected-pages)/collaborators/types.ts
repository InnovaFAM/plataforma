import { PaginatedResponse } from '@/@types'
import { TCertificate } from '../certifications/types'

export type Filter = {
    role?: string
    assignations?: string
    status?: string
}

export type TCollaboratorCertificate = {
    pk: string
    sk: string
    code?: string
    createdAt: string
    description?: string
    expiredAt?: string
    institution?: string
    name: string
    tags?: string[]
    type?: string
    key?: string
}
export type TCertificateRowStatus =
    | 'uploading'
    | 'uploaded'
    | 'processing'
    | 'processed'
    | 'error'

export type TCertificateRow = {
    tempId: string
    file: File
    status: TCertificateRowStatus
    fileKey?: string
    hash?: string
    originalData?: TCollaboratorCertificate
    editedData?: Partial<TCollaboratorCertificate>
    errorMessage?: string
    isSaved?: boolean
    hasChanges?: boolean
}

export type TCollaboratorAssignment = {
    serviceSk: string
    serviceName: string
    roleName: string
    endedAt: string
    startedAt: string
    status: string
}

export type TCollabShift = {
    type?: string
    description?: string
    startedAt?: string
    endedAt?: string
}

export type TCollaboratorEntity = {
    address?: string
    name?: string
    pk: string
    position?: string
    rut?: string
    sk: string
    status?: boolean
    email?: string
    contract?: {
        startAt?: string
        endAt?: string
        type?: string
    }
    annex?: string
    supervisor?: string
    vacationBalance?: string
    pictureUrl?: string
    personalNumber?: string
    workNumber?: string
    shift?: TCollabShift
    compliance?: number
    assignments?: Array<TCollaboratorAssignment>
    certificates?: {
        uploaded: TCollaboratorCertificate[]
        to_upload: TCertificate[]
    }
    evaluations?: TCollabEvaluation[]
}

export type TCollabsByRole = {
    sk: string
    email: string
    annex: boolean
    name: string
    compliance: number
    evaluations: number
    startedAt?: string
    endedAt?: string
    status: 'disponible' | 'no disponible' | 'propuesto' | 'confirmado'
    clearance?: boolean
    pictureUrl?: string
}

export type TCollaboratorsList = PaginatedResponse<
    Pick<
        TCollaboratorEntity,
        | 'pk'
        | 'sk'
        | 'name'
        | 'address'
        | 'position'
        | 'rut'
        | 'status'
        | 'assignments'
        | 'certificates'
        | 'pictureUrl'
    >
>

interface TCollabEvaluationDetailCriteria {
    name: string
    order: number
    result: number
    note: string
}

interface TCollabEvaluationDetail {
    name: string
    order: number
    criteria: TCollabEvaluationDetailCriteria[]
    result: string
}

interface TCollabRoleServiceMini {
    sk: string
    serviceName: string
}

export interface TCollabEvaluationPayload {
    createdBy: string
    createdAt: string
    type: 'General' | 'Por Servicio'
    result: string
    categories: TCollabEvaluationDetail[]
    service: TCollabRoleServiceMini | null
}

interface TEvaluationCommonProps {
    pk: string
    sk: string
    parentId: string | null
    entityId: string | null
}

export interface TCollabEvaluation
    extends TCollabEvaluationPayload, TEvaluationCommonProps {}
