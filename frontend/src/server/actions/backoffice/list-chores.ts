'use server'

import { TBackOfficeData } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListChores } from '@/services/BackofficeService'

export const listBackOfficeChores = async (
    nextToken?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['chores']>> => {
    return await apiListChores(nextToken, pageSize)
}
