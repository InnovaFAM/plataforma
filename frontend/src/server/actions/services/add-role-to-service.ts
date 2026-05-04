'use server'

import { TServiceRoleCreatePayload } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiAddRoleToService } from '@/services/ServicesService'

export const addRoleToService = async (
    data: TServiceRoleCreatePayload,
    serviceId: string,
): Promise<ServerResponse<void>> => {
    return await apiAddRoleToService(data, serviceId)
}
