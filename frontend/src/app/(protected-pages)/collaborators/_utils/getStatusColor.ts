
const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-emerald-200'
        case 'inactive':
            return 'bg-red-200'
        default:
            return 'bg-gray-200'
    }
}

export default getStatusColor
