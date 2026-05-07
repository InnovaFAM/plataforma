'use server'
import { ServerResponse } from '@/services/ApiService'
import {
    apiExportCollabs,
    apiSyncCollabById,
} from '@/services/CollaboratorsService'

export const exportCollabs = async (): Promise<ServerResponse<void>> => {
    return await apiExportCollabs()
}

export const syncCollabById = async (
    id: string,
): Promise<ServerResponse<void>> => {
    return await apiSyncCollabById(id)
}
