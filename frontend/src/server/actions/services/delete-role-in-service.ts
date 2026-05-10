'use server'
import { ServerResponse } from '@/services/ApiService'
import { apiDeleteRoleInService } from '@/services/ServicesService'

export const deleteRoleInService = async (
    serviceId: string,
    hash: string,
): Promise<ServerResponse<void>> => {
    return await apiDeleteRoleInService(serviceId, hash)
}
