import ApiService from './ApiService'
import { TEditUser } from '@/app/(protected-pages)/roles-users/types'
import { getAccessToken } from '@/utils/getAccessToken'

export async function apiUpdateUser(sk: string, data: TEditUser) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: '/users',
        method: 'patch',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data: { sk, ...data },
    })
}

export async function apiDeleteUser(userId: string) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<void>({
        url: `/users/${userId}`,
        method: 'delete',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
}
