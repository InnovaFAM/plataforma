'use server'
import { TCollabEvaluationPayload } from '@/app/(protected-pages)/collaborators/types'
import { ServerResponse } from '@/services/ApiService'
import { apiAddPerformanceEvaluationToCollab } from '@/services/CollaboratorsService'

export const addPerformanceEvaluationToCollab = async (
    collabId: string,
    data: TCollabEvaluationPayload,
): Promise<ServerResponse<void>> => {
    return await apiAddPerformanceEvaluationToCollab(collabId, data)
}
