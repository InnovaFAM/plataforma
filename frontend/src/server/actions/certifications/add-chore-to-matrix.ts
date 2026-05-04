'use server'

import { TChoreCertificateCreateBody } from '@/app/(protected-pages)/certifications/types'
import { ServerResponse } from '@/services/ApiService'
import { apiAddChoreToMatrix } from '@/services/CertificationsService'

export const addChoreToMatrix = async (
    data: TChoreCertificateCreateBody,
): Promise<ServerResponse<void>> => {
    return await apiAddChoreToMatrix(data)
}
