'use server'

import { TRoleCertificateCreateBody } from '@/app/(protected-pages)/certifications/types'
import { ServerResponse } from '@/services/ApiService'
import { apiAddRoleToMatrix } from '@/services/CertificationsService'

export const addRoleToMatrix = async (
    data: TRoleCertificateCreateBody,
): Promise<ServerResponse<void>> => {
    return await apiAddRoleToMatrix(data)
}
