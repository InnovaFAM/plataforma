import { TServiceStatus } from '../types'

const getStatusText = (
    status: TServiceStatus | undefined,
    t: (key: string) => string,
) => {
    switch (status) {
        case 'publicado':
            return t('services.status.published')
        case 'boceto':
            return t('services.status.draft')
        default:
            return status
    }
}

export default getStatusText
