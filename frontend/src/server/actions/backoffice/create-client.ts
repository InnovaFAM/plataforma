'use server'

import { TBackOfficeClientCreate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCreateClient } from '@/services/BackofficeService'

export const createClient = async (
    data: TBackOfficeClientCreate,
): Promise<ServerResponse<void>> => {
    const result = await apiCreateClient(data)
    return result
}
