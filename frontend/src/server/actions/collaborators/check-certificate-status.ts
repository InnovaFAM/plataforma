'use server'
import { TCollaboratorCertificate } from '@/app/(protected-pages)/collaborators/types'
import { ServerResponse } from '@/services/ApiService'
import { apiCheckCertificateStatus } from '@/services/CollaboratorsService'

export const checkCertificateStatus = async (
    hash: string,
): Promise<
    ServerResponse<{ found: boolean; data?: TCollaboratorCertificate }>
> => {
    return await apiCheckCertificateStatus(hash)
}
