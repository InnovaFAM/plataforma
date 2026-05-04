'use server'

import { TDetailedService } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiGetServiceById } from '@/services/ServicesService'

export const getServiceById = async (
    id: string,
): Promise<ServerResponse<TDetailedService>> => {
    return await apiGetServiceById(id)
}
