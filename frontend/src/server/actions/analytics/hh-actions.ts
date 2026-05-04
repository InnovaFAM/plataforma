import {
    HHDetailParams,
    HHDetailResponse,
    HHProjectionParams,
    HHProjectionResponse,
} from '@/app/(protected-pages)/analytics/hh-reports/types'
import {
    apiHHDetailService,
    apiHHProjectionService,
} from '@/services/AnalyticsService'
import { ServerResponse } from '@/services/ApiService'

export const getHHProjection = async (
    params?: HHProjectionParams,
): Promise<ServerResponse<HHProjectionResponse>> => {
    const response = await apiHHProjectionService(params)
    return response
}

export const getHHDetail = async (
    params?: HHDetailParams,
): Promise<ServerResponse<HHDetailResponse>> => {
    return await apiHHDetailService(params)
}
