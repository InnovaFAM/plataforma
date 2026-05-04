import { ServerResponse } from '@/services/ApiService'
import type { HHProjectionParams, HHProjectionResponse } from '../types'

export const getHHProjectionClient = async (
    params: HHProjectionParams,
): Promise<ServerResponse<HHProjectionResponse>> => {
    const searchParams = new URLSearchParams()

    if (params.month) {
        searchParams.set('month', params.month)
    }

    if (params.horizonMonths) {
        searchParams.set('horizonMonths', String(params.horizonMonths))
    }

    const response = await fetch(`/api/analytics/hh/projection?${searchParams}`)

    if (!response.ok) {
        throw new Error('Error loading HH projection')
    }
    const js = await response.json()
    return js
}
