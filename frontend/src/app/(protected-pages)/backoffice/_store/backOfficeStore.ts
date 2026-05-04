import { create } from 'zustand'
import {
    TBackOfficeCertificate,
    TBackOfficeChore,
    TBackOfficeClient,
    TBackOfficeDivision,
    TBackOfficeHoliday,
    TBackOfficeRole,
    TBackOfficeShift,
} from '../types'

type BackOfficeState = {
    tempShift: TBackOfficeShift | null
    tempCertification: TBackOfficeCertificate | null
    tempChore: TBackOfficeChore | null
    tempClient: TBackOfficeClient | null
    tempDivision: TBackOfficeDivision | null
    tempHoliday: TBackOfficeHoliday | null
    tempRole: TBackOfficeRole | null
}

type BackOfficeActions = {
    setTempShift: (data: TBackOfficeShift | null) => void
    setTempCertification: (data: TBackOfficeCertificate | null) => void
    setTempChore: (data: TBackOfficeChore | null) => void
    setTempClient: (data: TBackOfficeClient | null) => void
    setTempDivision: (data: TBackOfficeDivision | null) => void
    setTempHoliday: (data: TBackOfficeHoliday | null) => void
    setTempRole: (data: TBackOfficeRole | null) => void
    clearAllTemps: () => void
}

const initialState: BackOfficeState = {
    tempCertification: null,
    tempShift: null,
    tempChore: null,
    tempClient: null,
    tempDivision: null,
    tempHoliday: null,
    tempRole: null,
}

export const useBackOfficeStore = create<BackOfficeState & BackOfficeActions>(
    (set) => ({
        ...initialState,
        setTempCertification: (data) => set({ tempCertification: data }),
        setTempShift: (data) => set({ tempShift: data }),
        setTempChore: (data) => set({ tempChore: data }),
        setTempClient: (data) => set({ tempClient: data }),
        setTempDivision: (data) => set({ tempDivision: data }),
        setTempHoliday: (data) => set({ tempHoliday: data }),
        setTempRole: (data) => set({ tempRole: data }),
        clearAllTemps: () => set(initialState),
    }),
)
