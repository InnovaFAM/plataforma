import { TNewUser } from '@/app/(protected-pages)/roles-users/types'
import { ServerResponse } from '@/services/ApiService'
import { apiSaveUser } from '@/services/UsersService'

export const createUser = async (
    data: TNewUser,
): Promise<ServerResponse<void>> => {
    return await apiSaveUser(data)
}
