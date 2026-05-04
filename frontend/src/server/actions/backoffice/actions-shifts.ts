'use server'

import {
    apiCreateShift,
    apiListShifts,
    apiUpdateShift,
} from '@/services/BackofficeService'
import { ServerResponse } from '@/services/ApiService'
import {
    TBackOfficeData,
    TBackOfficeShiftCreate,
    TBackOfficeShiftUpdate,
} from '@/app/(protected-pages)/backoffice/types'

export const listBackOfficeShifts = async (
    nextToken?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['shifts']>> => {
    return await apiListShifts(nextToken, pageSize)
}

export const createShift = async (
    data: TBackOfficeShiftCreate,
): Promise<ServerResponse<void>> => {
    return await apiCreateShift(data)
}

export const updateShift = async (
    data: TBackOfficeShiftUpdate,
): Promise<ServerResponse<void>> => {
    return await apiUpdateShift(data)
}
