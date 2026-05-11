import { PaginatedResponse } from '@/@types'
import ApiService, { ServerResponse } from './ApiService'
import {
    TSystemRole,
    TUser,
    TNewUser,
    TRolesUsersData,
    TUserActivity,
    TUserNotification,
} from '@/app/(protected-pages)/roles-users/types'

export async function apiListAllUsers() {
    return ApiService.fetchDataWithAxios<TUser[]>({
        url: '/users/all',
        method: 'get',
    })
}

export async function apiListData() {
    return ApiService.fetchDataWithAxios<TRolesUsersData>({
        url: '/users/roles/data',
        method: 'get',
    })
}

export async function apiListAllRoles() {
    return ApiService.fetchDataWithAxios<TSystemRole[]>({
        url: '/users/roles',
        method: 'get',
    })
}

export async function apiGetUserByID(userId: string) {
    return ApiService.fetchDataWithAxios<TUser>({
        url: `/users/${userId}`,
        method: 'get',
    })
}

export async function apiUpdateLastLogin(userId: string, lastLogin: string) {
    return ApiService.fetchDataWithAxios<void>({
        url: '/users',
        method: 'patch',
        data: { sk: `USERS#${userId}`, lastLogin },
    })
}

export async function apiUpdatePhoneNumber(
    userId: string,
    phoneNumber: string,
) {
    return ApiService.fetchDataWithAxios<void>({
        url: '/users',
        method: 'patch',
        data: { sk: `USERS#${userId}`, phoneNumber },
    })
}

export const apiSaveUser = async (
    data: TNewUser,
): Promise<ServerResponse<void>> => {
    console.log('apiSaveUser', data)
    return ApiService.fetchDataWithAxios<void>({
        url: '/users',
        method: 'post',
        data,
    })
}

export const apiListActivities = async (
    userId: string,
    nextKey?: string,
    pageSize: number = 100,
): Promise<ServerResponse<PaginatedResponse<TUserActivity>>> => {
    return ApiService.fetchDataWithAxios<PaginatedResponse<TUserActivity>>({
        url: `/users/${userId}/activities`,
        method: 'get',
        params: { nextKey, pageSize },
    })
}

export const apiListNotifications = async (
    userId: string,
    pageSize: number,
    nextKey?: string,
): Promise<ServerResponse<PaginatedResponse<TUserNotification>>> => {
    return ApiService.fetchDataWithAxios<PaginatedResponse<TUserNotification>>({
        url: `/users/${userId}/notifications`,
        method: 'get',
        params: { nextKey, pageSize },
    })
}
