'use server'

import { TServiceRole } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiGetRoleByServiceId } from '@/services/ServicesService'

export const getRolesByServiceId = async (
    id: string,
): Promise<ServerResponse<TServiceRole[]>> => {
    return await apiGetRoleByServiceId(id)
}
