import { ServerResponse } from '@/services/ApiService'
import {
    apiUpdatePhoneNumber,
    apiUpdateLastLogin,
} from '@/services/UsersService'

export const updatePhoneNumber = async (
    userId: string,
    phoneNumber: string,
): Promise<ServerResponse<void>> => {
    return await apiUpdatePhoneNumber(userId, phoneNumber)
}

export const updateLastLogin = async (
    userId: string,
    lastLogin: string,
): Promise<ServerResponse<void>> => {
    return await apiUpdateLastLogin(userId, lastLogin)
}
