'use server'
import { ServerResponse } from '@/services/ApiService'
import {
    apiSyncCollabById,
    apiSyncCollabs,
} from '@/services/CollaboratorsService'

export const syncCollabs = async (): Promise<ServerResponse<void>> => {
    return await apiSyncCollabs()
}

export const syncCollabById = async (
    id: string,
): Promise<ServerResponse<void>> => {
    return await apiSyncCollabById(id)
}
