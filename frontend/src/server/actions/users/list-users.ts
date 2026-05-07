'use server'

import {
    TRolesUsersData,
    TUser,
} from '@/app/(protected-pages)/roles-users/types'
import { ServerResponse } from '@/services/ApiService'
import { apiGetUserByID, apiListData } from '@/services/UsersService'

export const listData = async (): Promise<ServerResponse<TRolesUsersData>> => {
    return await apiListData()
}

export const getByID = async (
    userId: string,
): Promise<ServerResponse<TUser>> => {
    return await apiGetUserByID(userId)
}
