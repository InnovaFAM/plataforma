'use server'

import { TBackOfficeRoleUpdate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateRole } from '@/services/BackofficeService'

export const updateRole = async (
    data: TBackOfficeRoleUpdate,
): Promise<ServerResponse<void>> => {
    return await apiUpdateRole(data)
}
