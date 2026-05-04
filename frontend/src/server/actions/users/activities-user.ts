'use server'
import { TUserActivity } from '@/app/(protected-pages)/roles-users/types'
import { PaginatedResponse } from '@/@types'
import { apiListActivities } from '@/services/UsersService'
import { ServerResponse } from '@/services/ApiService'

export const getUserActivities = async (
    userId: string,
    nextToken?: string,
): Promise<ServerResponse<PaginatedResponse<TUserActivity>>> => {
    return await apiListActivities(userId, nextToken, 100)
}
