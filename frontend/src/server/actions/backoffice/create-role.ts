'use server'

import { TBackOfficeRoleCreate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCreateRole } from '@/services/BackofficeService'

export const createRole = async (
    data: TBackOfficeRoleCreate,
): Promise<ServerResponse<void>> => {
    return await apiCreateRole(data)
}
