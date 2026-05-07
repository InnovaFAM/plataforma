import { useAccessStore } from '@/components/layouts/PostLoginLayout/stores/accessStore'

const ADMIN_ROLE_NAME = 'admin'

const isAdminRole = (roleName?: string) => {
    return roleName?.trim().toLowerCase() === ADMIN_ROLE_NAME
}

export const useCan = (permission: string) => {
    return useAccessStore((state) => {
        if (isAdminRole(state.user?.role?.name)) {
            return true
        }

        return state.permissions[permission] === true
    })
}

export const useCanAny = (permissions: string[]) => {
    return useAccessStore((state) => {
        if (isAdminRole(state.user?.role?.name)) {
            return true
        }

        return permissions.some(
            (permission) => state.permissions[permission] === true,
        )
    })
}

export const useCanAll = (permissions: string[]) => {
    return useAccessStore((state) => {
        if (isAdminRole(state.user?.role?.name)) {
            return true
        }

        return permissions.every(
            (permission) => state.permissions[permission] === true,
        )
    })
}

export const useCanViewSection = (sectionKey: string) => {
    return useCan(`${sectionKey}:view`)
}
