const getUserAvailabilityColor = (evaluation: number) => {
    if (evaluation > 0) return 'bg-green-500'

    return 'bg-red-500'
}

export default getUserAvailabilityColor
