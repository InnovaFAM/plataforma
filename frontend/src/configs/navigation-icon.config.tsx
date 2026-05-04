import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiCertificate,
    PiUsersThree,
    PiSuitcase,
    PiCalendar,
    PiBulldozer,
    PiMapPinLight,
    PiCalendarCheck,
    PiClockLight,
    PiUserSquareLight,
    PiShovel,
    PiLockKey,
    PiTimer,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    certificateMenu: <PiCertificate />,
    rolesMenu: <PiUsersThree />,
    clientsMenu: <PiSuitcase />,
    holidaysMenu: <PiCalendar />,
    choreMenu: <PiBulldozer />,
    divisionMenu: <PiMapPinLight />,
    projectMenu: <PiCalendarCheck />,
    hhMenu: <PiClockLight />,
    collabsMenu: <PiUserSquareLight />,
    servicesMenu: <PiShovel />,
    usersMenu: <PiLockKey />,
    shiftMenu: <PiTimer />,
}

export default navigationIcon
