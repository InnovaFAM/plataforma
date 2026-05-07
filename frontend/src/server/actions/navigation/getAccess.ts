import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { TUser } from '@/app/(protected-pages)/roles-users/types'
import { getByID } from '../users/list-users'

const ADMIN_ROLE_NAME = 'admin'

const isAdminRole = (roleName?: string) => {
    return roleName?.trim().toLowerCase() === ADMIN_ROLE_NAME
}

export const getCurrentUserAccessServer = cache(
    async (): Promise<TUser | undefined> => {
        const session = await auth()

        if (!session?.accessToken) {
            return undefined
        }

        const response = await getByID(session.user.id)

        if (response.status === 401) {
            return undefined
        }

        if (!response.success) {
            throw new Error('Error loading current user access')
        }

        return response.data
    },
)

export const canServer = async (permission: string) => {
    const user = await getCurrentUserAccessServer()

    if (!user) {
        return false
    }

    if (isAdminRole(user.role?.name)) {
        return true
    }

    return user.role?.permissions?.[permission] === true
}

export const canViewSectionServer = async (sectionKey: string) => {
    return canServer(`${sectionKey}:view`)
}

export const requireCanServer = async (permission: string) => {
    const canAccess = await canServer(permission)

    if (!canAccess) {
        redirect('/access-denied')
    }
}

export const requireCanViewSectionServer = async (sectionKey: string) => {
    const canAccess = await canViewSectionServer(sectionKey)

    if (!canAccess) {
        redirect('/access-denied')
    }
}
