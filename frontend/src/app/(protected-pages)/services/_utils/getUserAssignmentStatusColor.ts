const getUserAssignmentStatusColor = (status: string) => {
    switch (status) {
        case 'confirmado':
            return 'bg-green-100'
        case 'propuesto':
            return 'bg-yellow-200'
        default:
            return 'bg-gray-100'
    }
}

export default getUserAssignmentStatusColor
