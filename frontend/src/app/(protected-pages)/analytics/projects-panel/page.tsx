import type { PageProps } from '@/@types/common'
import ProjectsPanelHeader from './_components/ProjectsPanelHeader'
import ProjectsPanelContent from './_components/ProjectsPanelContent'
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query'
import { projectsAnalyticsKeys } from '@/server/actions/analytics/analytics-keys'
import { getProjectsAnalytics } from '@/server/actions/analytics/projects-actions'
import dayjs from 'dayjs'
import { redirect } from 'next/navigation'
import { canViewSectionServer } from '@/server/actions/navigation/getAccess'

export default async function Page({ searchParams }: PageProps) {
    const canViewSection = await canViewSectionServer('resume.projects')

    if (!canViewSection) {
        redirect('/home')
        return null
    }

    const params = await searchParams

    const normalizedParams = {
        month: Array.isArray(params.month)
            ? params.month[0]
            : params.month || dayjs().format('YYYY-MM'),
        statuses: Array.isArray(params.statuses)
            ? params.statuses
            : params.statuses
              ? params.statuses.split(',')
              : [],
        services: Array.isArray(params.services)
            ? params.services
            : params.services
              ? params.services.split(',')
              : [],
    }
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: projectsAnalyticsKeys.list(normalizedParams),
        queryFn: () => getProjectsAnalytics(normalizedParams),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <main className="py-4">
                <ProjectsPanelHeader />
                <ProjectsPanelContent params={normalizedParams} />
            </main>
        </HydrationBoundary>
    )
}
