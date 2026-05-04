export type HHReportSelectorsFilters = {
    months: string[]
}

export type DetailedHHReportSelectorsFilters = HHReportSelectorsFilters & {
    choreCodes: string[]
}

export type HHProjectionAvailableService = {
    serviceId: string
    serviceName: string
    status?: string
}

export type HHProjectionAppliedFilters = {
    month: string
    horizonMonths: number
}

export type HHProjectionAvailableFilters = {
    horizonOptions: number[]
}

export type HHProjectionKpis = {
    totalRequiredHH: number
    totalCoveredHH: number
    totalGapHH: number
    worstMonth: string | null
    worstMonthGapHH: number | null
}

export type HHProjectionByMonthItem = {
    month: string // YYYY-MM
    requiredHH: number
    confirmedHH: number
    proposedHH: number
    coveredHH: number
    gapHH: number
    coveragePct: number
}

export type HHProjectionResponse = {
    filters: {
        applied: HHProjectionAppliedFilters
        available: HHProjectionAvailableFilters
    }
    kpis: HHProjectionKpis
    charts: {
        hhProjectionByMonth: HHProjectionByMonthItem[]
    }
}

export type HHProjectionParams = {
    month?: string
    horizonMonths?: number
}

export type HHDetailAvailableService = {
    serviceId: string
    serviceName: string
    status?: string
}

export type HHDetailAppliedFilters = {
    months: string[]
    services: string[]
}

export type HHDetailAvailableFilters = {
    months: string[]
    services: HHDetailAvailableService[]
}

export type HHDetailKpis = {
    totalWorkedHH: number
    totalAbsenceHH: number
    activeServices: number
    absenceRatePct: number
}

export type HHDetailWorkedByServiceItem = {
    serviceId: string
    serviceName: string
    workedHH: number
}

export type HHDetailAbsenceByTypeItem = {
    type: string
    hours: number
}

export type HHDetailMonthRow = {
    month: string
    workedHH: number
    absenceHH: number
    overtimeHH: number
}

export type HHDetailTableRow = {
    serviceId: string
    serviceName: string
    totalHH: number
    totalAbsenceHH: number
    subRows: HHDetailMonthRow[]
}

export type HHDetailResponse = {
    filters: {
        applied: HHDetailAppliedFilters
        available: HHDetailAvailableFilters
    }
    kpis: HHDetailKpis
    charts: {
        workedHoursByService: HHDetailWorkedByServiceItem[]
        absencesByType: HHDetailAbsenceByTypeItem[]
    }
    table: HHDetailTableRow[]
}

export type HHDetailParams = {
    months?: string[]
    services?: string[]
}
