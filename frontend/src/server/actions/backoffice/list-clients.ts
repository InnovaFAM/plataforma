'use server'

import { TBackOfficeData } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListClients } from '@/services/BackofficeService'

export const listBackOfficeClients = async (
    nextToken?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['clients']>> => {
    return await apiListClients(nextToken, pageSize)
}
