import { TService } from '../types'

const getServicePriorityColor = (priority: TService['priority']) => {
    switch (priority) {
        case 'alta':
            return 'bg-red-200'
        case 'media':
            return 'bg-yellow-200'
        case 'baja':
            return 'bg-blue-200'
        default:
            return 'bg-gray-200'
    }
}

export default getServicePriorityColor
