import { TServiceStatus } from '../types'

const getStatusColor = (status: TServiceStatus | '') => {
    switch (status) {
        case 'publicado':
            return 'bg-emerald-200'
        case 'boceto':
            return 'bg-yellow-200'
        default:
            return 'bg-gray-200'
    }
}

const getStatusBadgeColor = (status: TServiceStatus | '') => {
    switch (status) {
        case 'publicado':
            return 'var(--success)'
        case 'boceto':
            return 'var(--warning)'
        default:
            return 'gray'
    }
}

export { getStatusColor, getStatusBadgeColor }
