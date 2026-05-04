'use client'

import { useEffect, useMemo } from 'react'

import ProjectsPanelSelectors from './ProjectsPanelSelectors'
import ProjectsPanelChartsSection from './ProjectsPanelChartsSection'
import ProjectsPanelRolesTable from './ProjectsPanelRolesTable'

import { useAnalyticsStore } from '../../_store/analyticsStore'
import { useProjectsAnalytics } from '../hooks'

interface ProjectsPanelContentProps {
    params: {
        month?: string
        statuses?: string[]
        services?: string[]
    }
}

const ProjectsPanelContent = ({ params }: ProjectsPanelContentProps) => {
    const { setProjectsPanelFilterData } = useAnalyticsStore()

    const urlFilters = useMemo(() => {
        return {
            month: params.month ?? '',
            statuses: params.statuses ?? [],
            services: params.services ?? [],
        }
    }, [params])

    const { month, statuses, services } = urlFilters

    const {
        data: response,
        isLoading,
        error,
    } = useProjectsAnalytics({
        month,
        statuses,
        services,
    })

    useEffect(() => {
        setProjectsPanelFilterData({
            month,
            statuses,
            services,
        })
    }, [month, statuses, services, setProjectsPanelFilterData])

    if (isLoading) {
        return <div className="mt-4">Cargando...</div>
    }

    if (error) {
        return <div className="mt-4">Error al cargar el panel</div>
    }

    return (
        <div className="relative flex flex-col gap-4 w-full mt-4">
            <ProjectsPanelSelectors data={response?.data} />
            <ProjectsPanelChartsSection data={response?.data} />
            <ProjectsPanelRolesTable data={response?.data} />
        </div>
    )
}

export default ProjectsPanelContent
