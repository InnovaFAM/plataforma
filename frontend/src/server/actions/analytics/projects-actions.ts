import {
    DashboardProjectsResponse,
    TProjectsAnalyticsParams,
} from '@/app/(protected-pages)/analytics/projects-panel/types'
import { apiProjectsService } from '@/services/AnalyticsService'
import { ServerResponse } from '@/services/ApiService'

export const getProjectsAnalytics = async (
    params?: TProjectsAnalyticsParams,
): Promise<ServerResponse<DashboardProjectsResponse>> => {
    const response = await apiProjectsService(params)

    return response
}
