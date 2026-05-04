import {
    TCollabEvaluationPayload,
    TCollaboratorCertificate,
    TCollaboratorEntity,
    TCollaboratorsList,
    TCollabsByRole,
} from '@/app/(protected-pages)/collaborators/types'
import ApiService, { ServerResponse } from './ApiService'
import { getAccessToken } from '@/utils/getAccessToken'
import { PaginatedResponse, FullResponse } from '@/@types/api-client'
import { TServiceRole } from '@/app/(protected-pages)/services/types'

export async function apiListCollaborators(
    nextKey?: string,
    pageSize: number = 100,
) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TCollaboratorsList>({
        url: '/collabs',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            nextKey,
            pageSize: pageSize,
        },
    })
}

export async function apiGetCollaboratorById(id: string) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TCollaboratorEntity>({
        url: `/collabs/${id}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export async function apiCheckCertificateStatus(hash: string) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<{
        found: boolean
        data?: TCollaboratorCertificate
    }>({
        url: `/checks/certificates/${hash}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export async function apiSaveCertificate(
    collaboratorId: string,
    data: Partial<TCollaboratorCertificate> & { key: string },
) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TCollaboratorCertificate>({
        url: `/collabs/${collaboratorId}/certificates`,
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export async function apiDeleteCertificate(
    collaboratorId: string,
    certificateHash: string,
) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/collabs/${collaboratorId}/certificates/${certificateHash}`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export async function apiGetCollaboratorsByRole(
    data: TServiceRole,
): Promise<ServerResponse<FullResponse<TCollabsByRole[]>>> {
    const accessToken = await getAccessToken()
    console.log(accessToken)
    return ApiService.fetchDataWithAxios<FullResponse<TCollabsByRole[]>>({
        url: `/collabs/by/role`,
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export async function apiAddPerformanceEvaluationToCollab(
    collabId: string,
    data: TCollabEvaluationPayload,
) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/collabs/${collabId}/evaluations`,
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export async function apiDeletePerformanceEvaluation(
    collabId: string,
    hash: string,
) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/collabs/${collabId}/evaluations/${hash}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'delete',
    })
}
