import { ServerResponse } from '@/services/ApiService'
import type { HHDetailParams, HHDetailResponse } from '../types'

export const getHHDetailClient = async (
    params: HHDetailParams,
): Promise<ServerResponse<HHDetailResponse>> => {
    const searchParams = new URLSearchParams()

    if (params.months && params.months.length > 0) {
        searchParams.set('months', params.months.join(','))
    }

    if (params.services && params.services.length > 0) {
        searchParams.set('services', params.services.join(','))
    }

    const response = await fetch(`/api/analytics/hh/detail?${searchParams}`)

    if (!response.ok) {
        throw new Error('Error loading HH detail')
    }

    return response.json()
}
