'use client'

import { projectsAnalyticsKeys } from '@/server/actions/analytics/analytics-keys'
import { useQuery } from '@tanstack/react-query'
import { TProjectsAnalyticsParams } from '@/app/(protected-pages)/analytics/projects-panel/types'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { getProjectsAnalytics } from '@/server/actions/analytics/projects-actions'

export const useProjectsAnalytics = (params: TProjectsAnalyticsParams) => {
    const { protectedQueryFn } = useProtectedQueryFn()
    return useQuery({
        queryKey: projectsAnalyticsKeys.list(params),
        queryFn: () => protectedQueryFn(() => getProjectsAnalytics(params)),
        staleTime: 1000 * 60 * 5, // 5 minutos
        refetchOnWindowFocus: false,
    })
}
