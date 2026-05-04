'use server'

import { TBackOfficeClientUpdate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateClient } from '@/services/BackofficeService'

export const updateClient = async (
    data: TBackOfficeClientUpdate,
): Promise<ServerResponse<void>> => {
    return await apiUpdateClient(data)
}
