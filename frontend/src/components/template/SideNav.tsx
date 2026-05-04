'use client'

import classNames from '@/utils/classNames'
import ScrollBar from '@/components/ui/ScrollBar'
import Logo from '@/components/template/Logo'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useTheme from '@/utils/hooks/useTheme'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import useNavigation from '@/utils/hooks/useNavigation'
import queryRoute from '@/utils/queryRoute'
import appConfig from '@/configs/app.config'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    SIDE_NAV_CONTENT_GUTTER,
    HEADER_HEIGHT,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import type { Mode } from '@/@types/theme'

type SideNavProps = {
    translationSetup?: boolean
    background?: boolean
    className?: string
    contentClass?: string
    currentRouteKey?: string
    mode?: Mode
}

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = ({
    translationSetup = appConfig.activeNavTranslation,
    background = true,
    className,
    contentClass,
    mode,
}: SideNavProps) => {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const fullPath = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname

    const route = queryRoute(fullPath)

    const { navigationTree } = useNavigation()

    const defaultMode = useTheme((state) => state.mode)
    const direction = useTheme((state) => state.direction)
    const sideNavCollapse = useTheme((state) => state.layout.sideNavCollapse)

    const currentRouteKey = route?.key || ''
    const { session } = useCurrentSession()

    return (
        <div
            style={sideNavCollapse ? sideNavCollapseStyle : sideNavStyle}
            className={classNames(
                'side-nav hidden lg:block h-screen',
                background && 'side-nav-bg',
                !sideNavCollapse && 'side-nav-expand',
                className,
            )}
        >
            <Link
                href={appConfig.authenticatedEntryPath}
                className="side-nav-header flex flex-col justify-center mt-8"
                style={{ height: HEADER_HEIGHT }}
            >
                <Logo
                    imgClass="max-h-18"
                    mode={mode || defaultMode}
                    type={sideNavCollapse ? 'streamline' : 'full'}
                    className={classNames(
                        sideNavCollapse && 'ltr:ml-[11.5px] ltr:mr-[11.5px]',
                        sideNavCollapse
                            ? SIDE_NAV_CONTENT_GUTTER
                            : LOGO_X_GUTTER,
                    )}
                />
            </Link>
            <div
                className={classNames('side-nav-content mt-8', contentClass)}
                style={{ height: `calc(100vh - ${HEADER_HEIGHT}px - 4rem)` }}
            >
                <ScrollBar direction={direction}>
                    <VerticalMenuContent
                        collapsed={sideNavCollapse}
                        navigationTree={navigationTree}
                        routeKey={currentRouteKey}
                        direction={direction}
                        translationSetup={translationSetup}
                        userAuthority={session?.user?.authority || []}
                    />
                </ScrollBar>
            </div>
        </div>
    )
}

export default SideNav
