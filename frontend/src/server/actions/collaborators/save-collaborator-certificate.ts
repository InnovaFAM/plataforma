'use server'
import { TCollaboratorCertificate } from '@/app/(protected-pages)/collaborators/types'
import { ServerResponse } from '@/services/ApiService'
import {
    apiDeleteCertificate,
    apiSaveCertificate,
} from '@/services/CollaboratorsService'

export const saveCertificate = async (
    collaboratorId: string,
    data: Partial<TCollaboratorCertificate> & { key: string },
): Promise<ServerResponse<TCollaboratorCertificate>> => {
    return await apiSaveCertificate(collaboratorId, data)
}

export const deleteCertificate = async (
    collaboratorId: string,
    certificateHash: string,
): Promise<ServerResponse<void>> => {
    return await apiDeleteCertificate(collaboratorId, certificateHash)
}
