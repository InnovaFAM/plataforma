'use server'

import { PaginatedResponse } from '@/@types/api-client'
import { TService } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListServices } from '@/services/ServicesService'

export const listServices = async (
    nextToken?: string,
): Promise<ServerResponse<PaginatedResponse<TService>>> => {
    return await apiListServices(nextToken, 100)
}
