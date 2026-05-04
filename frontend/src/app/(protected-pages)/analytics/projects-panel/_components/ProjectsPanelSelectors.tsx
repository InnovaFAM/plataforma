'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'

import useTranslation from '@/utils/hooks/useTranslation'
import { useAnalyticsStore } from '../../_store/analyticsStore'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import type { DashboardProjectsResponse } from '../types'
import dynamic from 'next/dynamic'
import { TSelect } from '@/@types'

const Select = dynamic(() => import('@/components/ui/Select/Select'), {
    ssr: false,
})

interface ProjectsPanelSelectorsProps {
    data?: DashboardProjectsResponse
}

const ProjectsPanelSelectors: React.FC<ProjectsPanelSelectorsProps> = ({
    data,
}) => {
    const t = useTranslation()

    const projectsPanelFilters = useAnalyticsStore(
        (state) => state.projectsPanelFilterData,
    )

    const { onAppendQueryParams } = useAppendQueryParams()

    const handleFilterChange = (
        filterKey: string,
        value: string | string[],
    ) => {
        onAppendQueryParams({
            [filterKey]: Array.isArray(value) ? value.join(',') : value,
        })
    }

    const monthOptions = useMemo(() => {
        const currentMonth = dayjs().startOf('month')

        return Array.from({ length: 24 }, (_, index) => {
            const month = currentMonth.subtract(12 - index, 'month')
            return {
                label: month.format('MMM-YY'),
                value: month.format('YYYY-MM'),
            }
        })
    }, [])

    const statusOptions = useMemo(() => {
        return (data?.filters.available.statuses ?? []).map((status) => ({
            label: status,
            value: status,
        }))
    }, [data])

    const servicesOptions = useMemo(() => {
        return (data?.filters.available.services ?? []).map((service) => ({
            label: service.serviceName,
            value: service.serviceId,
        }))
    }, [data])

    return (
        <AdaptiveCard>
            <div className="flex flex-col md:flex-row w-full justify-between items-center gap-4">
                <div className="flex flex-col gap-1 w-full md:w-[30%]">
                    <label className="text-sm text-muted-foreground">
                        {t('projectsPanel.content.monthsLabel')}
                    </label>
                    <Select
                        instanceId="projects-panel-months-selector"
                        placeholder={t('projectsPanel.selectPlaceholder')}
                        value={
                            monthOptions.find(
                                (option) =>
                                    option.value === projectsPanelFilters.month,
                            ) ?? null
                        }
                        options={monthOptions}
                        onChange={(value) =>
                            handleFilterChange(
                                'month',
                                (value as TSelect).value ?? '',
                            )
                        }
                    />
                </div>

                <div className="flex flex-col gap-1 w-full md:w-[30%]">
                    <label className="text-sm text-muted-foreground">
                        {t('projectsPanel.content.statusLabel')}
                    </label>
                    <Select
                        instanceId="projects-panel-status-selector"
                        placeholder={t('projectsPanel.selectPlaceholder')}
                        isMulti
                        options={statusOptions}
                        onChange={(values) =>
                            handleFilterChange(
                                'statuses',
                                (values as TSelect[]).map((v) => v.value),
                            )
                        }
                        value={statusOptions.filter((option) =>
                            projectsPanelFilters.statuses.includes(
                                option.value,
                            ),
                        )}
                    />
                </div>

                <div className="flex flex-col gap-1 w-full md:w-[40%]">
                    <label className="text-sm text-muted-foreground">
                        {t('projectsPanel.content.servicesLabel')}
                    </label>
                    <Select
                        instanceId="projects-panel-services-selector"
                        placeholder={t('projectsPanel.selectPlaceholder')}
                        value={servicesOptions.filter((option) =>
                            projectsPanelFilters.services.includes(
                                option.value,
                            ),
                        )}
                        isMulti
                        options={servicesOptions}
                        onChange={(values) => {
                            handleFilterChange(
                                'services',
                                (values as TSelect[]).map((v) => v.value),
                            )
                        }}
                    />
                </div>
            </div>
        </AdaptiveCard>
    )
}

export default ProjectsPanelSelectors
