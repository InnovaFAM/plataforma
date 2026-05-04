'use server'

import { TGlobalCertificationsResponse } from '@/app/(protected-pages)/certifications/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListGlobalCertifications } from '@/services/CertificationsService'

export const listGlobalCertifications = async (): Promise<
    ServerResponse<TGlobalCertificationsResponse>
> => {
    return await apiListGlobalCertifications()
}
