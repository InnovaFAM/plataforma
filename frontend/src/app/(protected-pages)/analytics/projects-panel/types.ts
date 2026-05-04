export type ProjectsPanelSelectorsFilters = {
    month: string
    statuses: string[]
    services: string[]
}

export type DashboardServiceFilter = {
    serviceId: string
    serviceName: string
    status?: string
}

export type TProjectsAnalyticsParams = {
    month?: string
    statuses?: string[]
    services?: string[]
}

export type DashboardAvailableService = {
    serviceId: string
    serviceName: string
    status?: string
}

export type DashboardAppliedFilters = {
    month: string
    statuses: string[]
    services: string[]
}

export type DashboardAvailableFilters = {
    services: DashboardAvailableService[]
    statuses: string[]
}

export type DashboardKpis = {
    totalRequired: number
    totalConfirmed: number
    totalProposed: number
    totalReal: number
    totalGap: number
    totalMissing: number
    totalSurplus: number
}

export type DashboardPopulationByProjectItem = {
    serviceId: string
    serviceName: string
    required: number
    confirmed: number
    proposed: number
    real: number
    gap: number
    missingCount: number
    surplusCount: number
}

export type DashboardServiceScheduleItem = {
    month: string
    required: number
    confirmed: number
    proposed: number
    real: number
    gap: number
    missingCount: number
    surplusCount: number
}

export type DashboardRoleTableItem = {
    serviceId: string
    serviceName: string
    roleId: string
    roleSk: string
    roleName: string
    requiredCount: number
    confirmedCount: number
    proposedCount: number
    realCount: number
    gap: number
    missingCount: number
    surplusCount: number
    status: 'complete' | 'missing'
    startedAt: string
    endedAt?: string | null
}

export type DashboardProjectsResponse = {
    filters: {
        applied: DashboardAppliedFilters
        available: DashboardAvailableFilters
    }
    kpis: DashboardKpis
    charts: {
        populationByProject: DashboardPopulationByProjectItem[]
        serviceSchedule: DashboardServiceScheduleItem[]
    }
    rolesTable: DashboardRoleTableItem[]
}

export type ProjectsAnalyticsParams = {
    month?: string
    statuses?: string[]
    services?: string[]
}
