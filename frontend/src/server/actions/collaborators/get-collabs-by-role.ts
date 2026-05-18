'use server'
import { FullResponse } from '@/@types'
import { TCollabsByRole } from '@/app/(protected-pages)/collaborators/types'
import { TServiceRole } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import {
    apiGetCollaboratorByRole,
    apiGetCollaboratorsByRole,
} from '@/services/CollaboratorsService'

export const getCollaboratorsByRole = async (
    data: TServiceRole,
): Promise<ServerResponse<FullResponse<TCollabsByRole>>> => {
    return await apiGetCollaboratorsByRole(data)
}

export const getCollabByRole = async (
    collaboratorId: string,
    data: TServiceRole,
): Promise<ServerResponse<TCollabsByRole>> => {
    return await apiGetCollaboratorByRole(collaboratorId, data)
}
