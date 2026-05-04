'use server'

import { TBackOfficeData } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListRoles } from '@/services/BackofficeService'

export const listBackOfficeRoles = async (
    nextToken?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['roles']>> => {
    return await apiListRoles(nextToken, pageSize)
}
