import {
    HHDetailParams,
    HHProjectionParams,
} from '@/app/(protected-pages)/analytics/hh-reports/types'
import { TProjectsAnalyticsParams } from '@/app/(protected-pages)/analytics/projects-panel/types'

export const projectsAnalyticsKeys = {
    all: ['projects-analytics'] as const,
    list: (params: TProjectsAnalyticsParams) =>
        [
            ...projectsAnalyticsKeys.all,
            {
                month: params.month ?? [],
                statuses: params.statuses ?? [],
                services: params.services ?? [],
            },
        ] as const,
}

export const hhProjectionKeys = {
    all: ['hh-projection'] as const,
    list: (params: HHProjectionParams) =>
        [
            ...hhProjectionKeys.all,
            {
                month: params.month ?? '',
                horizonMonths: params.horizonMonths ?? 12,
            },
        ] as const,
}

export const hhDetailKeys = {
    all: ['hh-detail'] as const,
    list: (params: HHDetailParams) =>
        [
            ...hhDetailKeys.all,
            {
                months: params.months ?? [],
                services: params.services ?? [],
            },
        ] as const,
}
