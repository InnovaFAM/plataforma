'use server'
import { ServerResponse } from '@/services/ApiService'
import { apiExportService, apiExportServices } from '@/services/ServicesService'

export const exportServices = async (): Promise<ServerResponse<void>> => {
    return await apiExportServices()
}

export const exportServiceById = async (
    serviceId: string,
): Promise<ServerResponse<void>> => {
    return await apiExportService(serviceId)
}
