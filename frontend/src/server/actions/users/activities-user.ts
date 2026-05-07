'use server'
import {
    TUserActivity,
    TUserNotification,
} from '@/app/(protected-pages)/roles-users/types'
import { PaginatedResponse } from '@/@types'
import {
    apiListActivities,
    apiListNotifications,
} from '@/services/UsersService'
import { ServerResponse } from '@/services/ApiService'

export const getUserActivities = async (
    userId: string,
    nextToken?: string,
): Promise<ServerResponse<PaginatedResponse<TUserActivity>>> => {
    return await apiListActivities(userId, nextToken, 100)
}

export const getUserNotifications = async (
    userId: string,
    nextToken?: string,
    pageSize: number = 30,
): Promise<ServerResponse<PaginatedResponse<TUserNotification>>> => {
    return await apiListNotifications(userId, pageSize, nextToken)
}
