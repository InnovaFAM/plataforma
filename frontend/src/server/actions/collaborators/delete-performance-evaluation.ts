'use server'
import { ServerResponse } from '@/services/ApiService'
import { apiDeletePerformanceEvaluation } from '@/services/CollaboratorsService'

export const deletePerformanceEvaluation = async (
    collabId: string,
    hash: string,
): Promise<ServerResponse<void>> => {
    return await apiDeletePerformanceEvaluation(collabId, hash)
}
