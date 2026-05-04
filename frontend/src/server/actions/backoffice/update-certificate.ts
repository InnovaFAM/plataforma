'use server'

import { TBackOfficeCertificateUpdate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiUpdateCertificate } from '@/services/BackofficeService'

export const updateCertificate = async (
    data: TBackOfficeCertificateUpdate,
): Promise<ServerResponse<void>> => {
    return await apiUpdateCertificate(data)
}
