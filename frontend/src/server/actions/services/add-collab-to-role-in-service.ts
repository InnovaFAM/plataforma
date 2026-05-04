'use server'

import {
    TServiceRoleAssignment,
    TServiceRoleAssignmentUpdatePayload,
} from '@/app/(protected-pages)/services/types'
import { ServerResponse } from '@/services/ApiService'
import {
    apiAddCollabToRoleInService,
    apiUpdateCollabToRoleInService,
    deleteUpdateCollabToRoleInService,
} from '@/services/ServicesService'

export const addCollabToRoleInService = async (
    data: TServiceRoleAssignment,
    serviceId: string,
    roleHash: string,
    collabId: string,
): Promise<ServerResponse<void>> => {
    return await apiAddCollabToRoleInService(
        data,
        serviceId,
        roleHash,
        collabId,
    )
}

export const updateCollabToRoleInService = async (
    data: TServiceRoleAssignmentUpdatePayload,
    serviceId: string,
    roleHash: string,
    collabId: string,
): Promise<ServerResponse<void>> => {
    return await apiUpdateCollabToRoleInService(
        data,
        serviceId,
        roleHash,
        collabId,
    )
}

export const deleteCollabToRoleInService = async (
    serviceId: string,
    roleHash: string,
    collabId: string,
): Promise<ServerResponse<void>> => {
    return await deleteUpdateCollabToRoleInService(
        serviceId,
        roleHash,
        collabId,
    )
}
