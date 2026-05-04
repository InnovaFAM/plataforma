import { create } from 'zustand'
import type { ProjectsPanelSelectorsFilters } from '../projects-panel/types'
import {
    DetailedHHReportSelectorsFilters,
    HHReportSelectorsFilters,
} from '../hh-reports/types'

export const initialProjectsPanelFilter: ProjectsPanelSelectorsFilters = {
    statuses: [],
    services: [],
    month: '',
}

export const initialHHReportFilter: HHReportSelectorsFilters = {
    months: [],
}

export const initialDetailedHHReportFilter: DetailedHHReportSelectorsFilters = {
    choreCodes: [],
    months: [],
}

export type AnalyticsState = {
    projectsPanelFilterData: ProjectsPanelSelectorsFilters
    HHReportFilterData: HHReportSelectorsFilters
    DetailedHHReportFilterData: DetailedHHReportSelectorsFilters
}

type AnalyticsAction = {
    setProjectsPanelFilterData: (payload: ProjectsPanelSelectorsFilters) => void
    setHHReportFilterData: (payload: HHReportSelectorsFilters) => void
    setDetailedHHReportFilterData: (
        payload: DetailedHHReportSelectorsFilters,
    ) => void
}

const initialState: AnalyticsState = {
    projectsPanelFilterData: initialProjectsPanelFilter,
    HHReportFilterData: initialHHReportFilter,
    DetailedHHReportFilterData: initialDetailedHHReportFilter,
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsAction>(
    (set) => ({
        ...initialState,
        setProjectsPanelFilterData: (payload) =>
            set(() => ({ projectsPanelFilterData: payload })),
        setHHReportFilterData: (payload) =>
            set(() => ({ HHReportFilterData: payload })),
        setDetailedHHReportFilterData: (payload) =>
            set(() => ({ DetailedHHReportFilterData: payload })),
    }),
)
