'use server'

import { TDetailedService } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateService } from '@/services/ServicesService'

export const updateService = async (
    data: Partial<TDetailedService>,
): Promise<ServerResponse<void>> => {
    return await apiUpdateService(data)
}
