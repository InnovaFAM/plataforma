'use server'

import { TBackOfficeDivisionUpdate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateDivision } from '@/services/BackofficeService'

export const updateDivision = async (
    data: TBackOfficeDivisionUpdate,
): Promise<ServerResponse<void>> => {
    return await apiUpdateDivision(data)
}
