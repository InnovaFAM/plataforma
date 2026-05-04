'use server'

import { TChoreCertificationsResponse } from '@/app/(protected-pages)/certifications/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListChoreCertifications } from '@/services/CertificationsService'

export const listChoreCertifications = async (): Promise<
    ServerResponse<TChoreCertificationsResponse>
> => {
    return await apiListChoreCertifications()
}
