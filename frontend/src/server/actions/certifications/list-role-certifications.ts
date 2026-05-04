'use server'

import { TRoleCertificationsResponse } from '@/app/(protected-pages)/certifications/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListRoleCertifications } from '@/services/CertificationsService'

export const listRoleCertifications = async (): Promise<
    ServerResponse<TRoleCertificationsResponse>
> => {
    return await apiListRoleCertifications()
}
