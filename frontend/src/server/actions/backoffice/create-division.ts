'use server'

import { TBackOfficeDivisionCreate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCreateDivision } from '@/services/BackofficeService'

export const createDivision = async (
    data: TBackOfficeDivisionCreate,
): Promise<ServerResponse<void>> => {
    return await apiCreateDivision(data)
}
