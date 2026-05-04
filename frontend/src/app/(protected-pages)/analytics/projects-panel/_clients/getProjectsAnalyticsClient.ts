import { ServerResponse } from '@/services/ApiService'
import type {
    DashboardProjectsResponse,
    TProjectsAnalyticsParams,
} from '../types'

export const getProjectsAnalyticsClient = async (
    params: TProjectsAnalyticsParams,
): Promise<ServerResponse<DashboardProjectsResponse>> => {
    const searchParams = new URLSearchParams()

    if (params.month?.length) {
        searchParams.set('month', params.month)
    }

    if (params.statuses?.length) {
        searchParams.set('statuses', params.statuses.join(','))
    }

    if (params.services?.length) {
        searchParams.set('services', params.services.join(','))
    }

    const res = await fetch(
        `http://localhost:3000/api/analytics/projects?${searchParams}`,
    )

    if (!res.ok) {
        throw new Error('Error loading projects analytics')
    }
    const response = await res.json()
    console.log(response)
    return response
}
