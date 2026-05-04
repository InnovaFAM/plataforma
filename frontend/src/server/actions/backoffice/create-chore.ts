'use server'

import { TBackOfficeChoreCreate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCreateChore } from '@/services/BackofficeService'

export const createChore = async (
    data: TBackOfficeChoreCreate,
): Promise<ServerResponse<void>> => {
    return await apiCreateChore(data)
}
