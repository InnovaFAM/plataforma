import { THolidayType } from '../types'

const getHolidayTypeText = (
    holidayType: THolidayType,
    t: (key: string) => string,
) => {
    switch (holidayType) {
        case 'auto':
            return t('backOffice.holidayType.auto')
        case 'manual':
            return t('backOffice.holidayType.manual')
        default:
            return holidayType
    }
}

export default getHolidayTypeText
