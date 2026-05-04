'use server'

import { TBackOfficeData } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListHolidays } from '@/services/BackofficeService'

export const listBackOfficeHolidays = async (
    nextToken?: string,
): Promise<ServerResponse<TBackOfficeData['holidays']>> => {
    return await apiListHolidays(nextToken, 100)
}