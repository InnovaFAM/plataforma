'use server'

import { TBackOfficeData } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListDivisions } from '@/services/BackofficeService'

export const listBackOfficeDivisions = async (
    nextToken?: string,
    pageSize: number = 100,
): Promise<ServerResponse<TBackOfficeData['divisions']>> => {
    return await apiListDivisions(nextToken, pageSize)
}
