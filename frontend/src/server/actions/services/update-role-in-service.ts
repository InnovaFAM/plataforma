'use server'

import { TServiceRole } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateRoleInService } from '@/services/ServicesService'

export const updateRoleInService = async (
    data: Partial<TServiceRole>,
    serviceId: string,
): Promise<ServerResponse<void>> => {
    return await apiUpdateRoleInService(data, serviceId)
}
