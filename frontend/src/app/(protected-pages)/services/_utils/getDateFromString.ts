export const getDateFromString = (value: string) => {
    if (!value) return undefined
    value = value.indexOf('T') !== -1 ? value.split('T')[0] : value
    if (value.indexOf('/') !== -1) {
        const [day, month, year] = value.split('/').map(Number)
        const date = new Date(year, month - 1, day)
        return date
    }
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date
}
