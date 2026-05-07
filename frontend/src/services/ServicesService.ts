import {
    TDetailedService,
    TService,
    TServiceRole,
    TServiceRoleAssignment,
    TServiceRoleAssignmentUpdatePayload,
    TServiceRoleCreatePayload,
} from '@/app/(protected-pages)/services/types'
import ApiService, { ServerResponse } from './ApiService'
import { PaginatedResponse } from '@/@types'
import { getAccessToken } from '@/utils/getAccessToken'

export const apiListServices = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<PaginatedResponse<TService>>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<PaginatedResponse<TService>>({
        url: '/services',
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

export const apiGetServiceById = async (
    id: string,
): Promise<ServerResponse<TDetailedService>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TDetailedService>({
        url: `/services/${id}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export const apiGetRoleByServiceId = async (
    serviceId: string,
): Promise<ServerResponse<TServiceRole[]>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TServiceRole[]>({
        url: `/services/${serviceId}/roles`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export const apiAddCollabToRoleInService = async (
    data: TServiceRoleAssignment,
    serviceId: string,
    roleHash: string,
    collabId: string,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services/${serviceId}/roles/${roleHash}/collabs/${collabId}`,
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const deleteUpdateCollabToRoleInService = async (
    serviceId: string,
    roleHash: string,
    collabId: string,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services/${serviceId}/roles/${roleHash}/collabs/${collabId}`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}

export const apiUpdateCollabToRoleInService = async (
    data: TServiceRoleAssignmentUpdatePayload,
    serviceId: string,
    roleHash: string,
    collabId: string,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services/${serviceId}/roles/${roleHash}/collabs/${collabId}`,
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiAddRoleToService = async (
    data: TServiceRoleCreatePayload,
    serviceId: string,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services/${serviceId}/roles`,
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateRoleInService = async (
    data: Partial<TServiceRole>,
    serviceId: string,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services/${serviceId}/roles`,
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiCreateService = async (
    data: Partial<TDetailedService>,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/services',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateService = async (
    data: Partial<TDetailedService>,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services`,
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export async function apiExportServices(): Promise<ServerResponse<void>> {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services/export`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export const apiExportService = async (
    serviceId: string,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/services/${serviceId}/export`,
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
