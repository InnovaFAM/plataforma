'use server'

import { TBackOfficeCertificateCreate } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCreateCertificate } from '@/services/BackofficeService'

export const createCertificate = async (
    data: TBackOfficeCertificateCreate,
): Promise<ServerResponse<void>> => {
    return await apiCreateCertificate(data)
}
