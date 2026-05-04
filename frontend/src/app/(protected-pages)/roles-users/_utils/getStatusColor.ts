import { TUser } from '../types'

const getStatusColor = (status?: TUser['status'] | '') => {
    switch (status) {
        case 'activo':
            return 'bg-emerald-200'
        case 'inactivo':
            return 'bg-red-200'
        default:
            return 'bg-gray-200'
    }
}

export default getStatusColor
