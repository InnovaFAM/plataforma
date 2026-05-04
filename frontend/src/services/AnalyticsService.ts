import {
    DashboardProjectsResponse,
    TProjectsAnalyticsParams,
} from '@/app/(protected-pages)/analytics/projects-panel/types'
import ApiService, { ServerResponse } from './ApiService'
import { getAccessToken } from '@/utils/getAccessToken'
import {
    HHDetailParams,
    HHDetailResponse,
    HHProjectionParams,
    HHProjectionResponse,
} from '@/app/(protected-pages)/analytics/hh-reports/types'

export const apiProjectsService = async (
    params?: TProjectsAnalyticsParams,
): Promise<ServerResponse<DashboardProjectsResponse>> => {
    const accessToken = await getAccessToken()

    return ApiService.fetchDataWithAxios<DashboardProjectsResponse>({
        url: '/analytics/projects',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            month: params?.month,
            statuses: params?.statuses?.join(','),
            services: params?.services?.join(','),
        },
    })
}

export const apiHHProjectionService = async (
    params?: HHProjectionParams,
): Promise<ServerResponse<HHProjectionResponse>> => {
    const accessToken = await getAccessToken()

    return ApiService.fetchDataWithAxios<HHProjectionResponse>({
        url: '/analytics/hh/projection',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            month: params?.month,
            horizonMonths: params?.horizonMonths || 6,
        },
    })
}

export const apiHHDetailService = async (
    params?: HHDetailParams,
): Promise<ServerResponse<HHDetailResponse>> => {
    const accessToken = await getAccessToken()

    return ApiService.fetchDataWithAxios<HHDetailResponse>({
        url: '/analytics/hh/detail',
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            months: params?.months?.join(','),
            services: params?.services?.join(','),
        },
    })
}
