'use server'
import { TCollaboratorsList } from '@/app/(protected-pages)/collaborators/types'
import { ServerResponse } from '@/services/ApiService'
import { apiListCollaborators } from '@/services/CollaboratorsService'

export const listCollaborators = async (
    nextToken?: string,
    pageSize: number = 500,
): Promise<ServerResponse<TCollaboratorsList>> => {
    return await apiListCollaborators(nextToken, pageSize)
}
