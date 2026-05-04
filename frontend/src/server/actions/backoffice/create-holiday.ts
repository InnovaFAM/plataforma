'use server'

import { TBackOfficeHolidayCreate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCreateHoliday } from '@/services/BackofficeService'

export const createHoliday = async (
    data: TBackOfficeHolidayCreate,
): Promise<ServerResponse<void>> => {
    return await apiCreateHoliday(data)
}
