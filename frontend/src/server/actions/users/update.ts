'use server'

import { TEditUser } from '@/app/(protected-pages)/roles-users/types'
import { ServerResponse } from '@/services/ApiService'
import { apiDeleteUser, apiUpdateUser } from '@/services/UserService'

export const updateUser = async (
    sk: string,
    data: TEditUser,
): Promise<ServerResponse<void>> => {
    return await apiUpdateUser(sk, data)
}

export const deleteUser = async (
    userId: string,
): Promise<ServerResponse<void>> => {
    return await apiDeleteUser(userId)
}
