'use server'

import { ServerResponse } from '@/services/ApiService'
import { apiRemoveCertificateFromMatrix } from '@/services/CertificationsService'

export const removeRoleFromMatrix = async (
    pk: string,
    sk: string,
): Promise<ServerResponse<void>> => {
    return await apiRemoveCertificateFromMatrix(pk, sk)
}
