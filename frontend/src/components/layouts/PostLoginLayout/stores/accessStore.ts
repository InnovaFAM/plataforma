// stores/accessStore.ts
import { TPermission, TUser } from '@/app/(protected-pages)/roles-users/types'
import { create } from 'zustand'

type AccessStatus = 'idle' | 'loading' | 'ready' | 'error'

type AccessState = {
    status: AccessStatus
    user: TUser | null
    permissions: TPermission

    setLoading: () => void
    setAccess: (user: TUser) => void
    setError: () => void
    resetAccess: () => void
}

const getPermissionsFromUser = (user: TUser): TPermission => {
    return user.role?.permissions ?? {}
}

export const useAccessStore = create<AccessState>((set) => ({
    status: 'idle',
    user: null,
    permissions: {},

    setLoading: () => {
        set({ status: 'loading' })
    },

    setAccess: (user) => {
        set({
            status: 'ready',
            user,
            permissions: getPermissionsFromUser(user),
        })
    },

    setError: () => {
        set({ status: 'error' })
    },

    resetAccess: () => {
        set({
            status: 'idle',
            user: null,
            permissions: {},
        })
    },
}))
