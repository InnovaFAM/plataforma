'use server'
import { FullResponse } from '@/@types'
import { TCollabsByRole } from '@/app/(protected-pages)/collaborators/types'
import { TServiceRole } from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import { apiGetCollaboratorsByRole } from '@/services/CollaboratorsService'

export const getCollaboratorsByRole = async (
    data: TServiceRole,
): Promise<ServerResponse<FullResponse<TCollabsByRole[]>>> => {
    return await apiGetCollaboratorsByRole(data)
}
