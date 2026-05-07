'use client'

import NavigationContext from './NavigationContext'

import type { NavigationTree } from '@/@types/navigation'
import type { CommonProps } from '@/@types/common'
import { useFilteredNavigationConfig } from '@/hooks/useFilteredNavigationConfig'

interface NavigationProviderProps extends CommonProps {
    navigationTree: NavigationTree[]
}

const NavigationProvider = ({
    navigationTree,
    children,
}: NavigationProviderProps) => {
    const filteredNavigationConfig = useFilteredNavigationConfig(navigationTree)
    return (
        <NavigationContext.Provider
            value={{ navigationTree: filteredNavigationConfig }}
        >
            {children}
        </NavigationContext.Provider>
    )
}

export default NavigationProvider
