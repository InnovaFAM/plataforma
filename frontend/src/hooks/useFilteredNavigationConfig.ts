// utils/hooks/useFilteredNavigationConfig.ts
import { useMemo } from 'react'
import type { NavigationTree } from '@/@types/navigation'
import { useAccessStore } from '@/components/layouts/PostLoginLayout/stores/accessStore'

const ADMIN_ROLE_NAME = 'admin'

const isAdminRole = (roleName?: string) => {
    return roleName?.trim().toLowerCase() === ADMIN_ROLE_NAME
}

const getViewPermissionKey = (navigationKey: string) => {
    return `${navigationKey}:view`
}

const canViewNavigationItem = (
    key: string,
    permissions: Record<string, boolean>,
    isAdmin: boolean,
) => {
    if (isAdmin) {
        return true
    }

    return permissions[getViewPermissionKey(key)] === true
}

const filterNavigationByPermissions = (
    items: NavigationTree[],
    permissions: Record<string, boolean>,
    isAdmin: boolean,
): NavigationTree[] => {
    return items.reduce<NavigationTree[]>((acc, item) => {
        const hasSubMenu = item.subMenu?.length > 0

        const canViewCurrentItem = canViewNavigationItem(
            item.key,
            permissions,
            isAdmin,
        )

        /**
         * Si es admin, o si el item actual tiene permiso directo,
         * se muestra completo, incluyendo todos sus hijos sin filtrarlos.
         *
         * Ejemplo:
         * backOffice:view = true
         * => muestra todos los hijos de backOffice.
         */
        if (canViewCurrentItem) {
            acc.push({
                ...item,
                subMenu: item.subMenu ?? [],
            })

            return acc
        }

        /**
         * Si el padre NO tiene permiso directo, pero tiene hijos,
         * filtramos los hijos individualmente.
         *
         * Ejemplo:
         * backOffice:view = false
         * backOffice.shifts:view = true
         * => muestra Back Office solo con Turnos.
         */
        if (hasSubMenu) {
            const filteredSubMenu = filterNavigationByPermissions(
                item.subMenu,
                permissions,
                isAdmin,
            )

            if (filteredSubMenu.length > 0) {
                acc.push({
                    ...item,
                    subMenu: filteredSubMenu,
                })
            }

            return acc
        }

        return acc
    }, [])
}

export const useFilteredNavigationConfig = (
    navigationConfig: NavigationTree[],
) => {
    const permissions = useAccessStore((state) => state.permissions)
    const roleName = useAccessStore((state) => state.user?.role?.name)

    const isAdmin = isAdminRole(roleName)

    return useMemo(() => {
        return filterNavigationByPermissions(
            navigationConfig,
            permissions,
            isAdmin,
        )
    }, [navigationConfig, permissions, isAdmin])
}
