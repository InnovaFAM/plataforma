'use server'

import { TDetailedService } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCreateService } from '@/services/ServicesService'

export const createService = async (
    data: Partial<TDetailedService>,
): Promise<ServerResponse<void>> => {
    return await apiCreateService(data)
}
