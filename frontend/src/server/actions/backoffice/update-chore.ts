'use server'

import { TBackOfficeChoreUpdate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateChore } from '@/services/BackofficeService'

export const updateChore = async (
    data: TBackOfficeChoreUpdate,
): Promise<ServerResponse<void>> => {
    return await apiUpdateChore(data)
}
