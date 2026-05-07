'use server'
import { HomeResponse } from '@/app/(protected-pages)/home/types'
import { apiHomeService } from '@/services/AnalyticsService'
import { ServerResponse } from '@/services/ApiService'

export const getHome = async (): Promise<ServerResponse<HomeResponse>> => {
    return await apiHomeService()
}
