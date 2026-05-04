import {
    TBackOfficeClientCreate,
    TBackOfficeHolidayCreate,
    TBackOfficeHolidayUpdate,
    TBackOfficeRoleCreate,
    TBackOfficeRoleUpdate,
    TBackOfficeData,
    TBackOfficeClientUpdate,
    TBackOfficeChoreUpdate,
    TBackOfficeChoreCreate,
    TBackOfficeDivisionCreate,
    TBackOfficeDivisionUpdate,
    TBackOfficeCertificateCreate,
    TBackOfficeCertificateUpdate,
    TBackOfficeShiftCreate,
    TBackOfficeShiftUpdate,
} from '@/app/(protected-pages)/backoffice/types'
import ApiService, { ServerResponse } from './ApiService'
import { getAccessToken } from '@/utils/getAccessToken'
export const apiListClients = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['clients']>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TBackOfficeData['clients']>({
        url: '/backoffice/clients',
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

export const apiCreateClient = async (
    data: TBackOfficeClientCreate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return await ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/clients',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateClient = async (
    data: TBackOfficeClientUpdate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/clients',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiListHolidays = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['holidays']>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TBackOfficeData['holidays']>({
        url: '/backoffice/holidays',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: { nextKey, pageSize },
    })
}

export const apiCreateHoliday = async (
    data: TBackOfficeHolidayCreate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/holidays',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateHoliday = async (
    data: TBackOfficeHolidayUpdate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/holidays',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiListRoles = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['roles']>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TBackOfficeData['roles']>({
        url: '/backoffice/roles',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: { nextKey, pageSize },
    })
}

export const apiCreateRole = async (
    data: TBackOfficeRoleCreate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/roles',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateRole = async (
    data: TBackOfficeRoleUpdate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/roles',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiListChores = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['chores']>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TBackOfficeData['chores']>({
        url: '/backoffice/chores',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: { nextKey, pageSize },
    })
}

export const apiCreateChore = async (
    data: TBackOfficeChoreCreate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/chores',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateChore = async (
    data: TBackOfficeChoreUpdate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/chores',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiListDivisions = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['divisions']>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TBackOfficeData['divisions']>({
        url: '/backoffice/divisions',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: { nextKey, pageSize },
    })
}

export const apiCreateDivision = async (
    data: TBackOfficeDivisionCreate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/divisions',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateDivision = async (
    data: TBackOfficeDivisionUpdate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/divisions',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiListCertificates = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['certifications']>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TBackOfficeData['certifications']>({
        url: '/backoffice/certificates',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: { nextKey, pageSize },
    })
}

export const apiCreateCertificate = async (
    data: TBackOfficeCertificateCreate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/certificates',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateCertificate = async (
    data: TBackOfficeCertificateUpdate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/certificates',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiListShifts = async (
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['shifts']>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<TBackOfficeData['shifts']>({
        url: '/backoffice/shifts',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: { nextKey, pageSize },
    })
}

export const apiCreateShift = async (
    data: TBackOfficeShiftCreate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/chores',
        method: 'post',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}

export const apiUpdateShift = async (
    data: TBackOfficeShiftUpdate,
): Promise<ServerResponse<void>> => {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/backoffice/chores',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data,
    })
}
