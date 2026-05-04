import {
    TChoreCertificateCreateBody,
    TChoreCertificationsResponse,
    TGlobalCertificationsResponse,
    TRoleCertificateCreateBody,
    TRoleCertificationsResponse,
} from '@/app/(protected-pages)/certifications/types'
import ApiService from './ApiService'
import { getAccessToken } from '@/utils/getAccessToken'

export async function apiListGlobalCertifications() {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TGlobalCertificationsResponse>({
        url: '/certificates/globals',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export async function apiListRoleCertifications() {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TRoleCertificationsResponse>({
        url: '/certificates/roles',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export async function apiListChoreCertifications() {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TChoreCertificationsResponse>({
        url: '/certificates/chores',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export async function apiAddRoleToMatrix(body: TRoleCertificateCreateBody) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/certificates/roles',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'post',
        data: body,
    })
}

export async function apiAddChoreToMatrix(body: TChoreCertificateCreateBody) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/certificates/chores',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'post',
        data: body,
    })
}

export async function apiRemoveCertificateFromMatrix(pk: string, sk: string) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/certificates`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data: { pk, sk },
    })
}
