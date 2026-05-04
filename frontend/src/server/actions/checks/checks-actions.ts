'use server'
import { TCollaboratorCertificate } from '@/app/(protected-pages)/collaborators/types'
import { TService } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import {
    apiCheckCertificateStatus,
    apiCheckServiceStatus,
} from '@/services/ChecksService'

export const checkCertificateStatus = async (
    hash: string,
): Promise<
    ServerResponse<{ found: boolean; data?: TCollaboratorCertificate }>
> => {
    return await apiCheckCertificateStatus(hash)
}

export const checkServiceStatus = async (
    hash: string,
): Promise<ServerResponse<{ found: boolean; data?: Partial<TService> }>> => {
    return await apiCheckServiceStatus(hash)
}
