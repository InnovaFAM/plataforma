'use server'

import { TBackOfficeHolidayUpdate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateHoliday } from '@/services/BackofficeService'

export const updateHoliday = async (
    data: TBackOfficeHolidayUpdate,
): Promise<ServerResponse<void>> => {
    return await apiUpdateHoliday(data)
}