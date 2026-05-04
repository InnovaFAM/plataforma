import { TDetailedService } from '../types'

const getServicePriorityText = (
    priority: TDetailedService['priority'],
    t: (key: string) => string,
) => {
    switch (priority) {
        case 'alta':
            return t('services.priority.high')
        case 'media':
            return t('services.priority.medium')
        case 'baja':
            return t('services.priority.low')
        case 'terminada':
            return t('services.priority.finished')
        default:
            return '–'
    }
}

export default getServicePriorityText
