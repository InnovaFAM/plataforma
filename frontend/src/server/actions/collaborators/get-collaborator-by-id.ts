'use server'
import { TCollaboratorEntity } from '@/app/(protected-pages)/collaborators/types'
import { ServerResponse } from '@/services/ApiService'
import { apiGetCollaboratorById } from '@/services/CollaboratorsService'

export const getCollaboratorById = async (
    id: string,
): Promise<ServerResponse<TCollaboratorEntity>> => {
    return await apiGetCollaboratorById(id)
}
