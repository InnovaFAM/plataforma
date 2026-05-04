'use server'

import { TBackOfficeData } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListCertificates } from '@/services/BackofficeService'

export const listBackOfficeCertificates = async (
    nextToken?: string,
): Promise<ServerResponse<TBackOfficeData['certifications']>> => {
    return await apiListCertificates(nextToken, 100)
}
