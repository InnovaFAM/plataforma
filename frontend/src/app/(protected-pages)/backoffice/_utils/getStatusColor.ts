
const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-200 text-emerald-600'
        case 'inactive':
            return 'bg-red-200 text-red-600'
        default:
            return 'bg-gray-200 text-gray-600'
    }
}

export default getStatusColor
