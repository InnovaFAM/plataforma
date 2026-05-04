export const getDateFromString = (value: string) => {
    if (value.indexOf('/') !== -1) {
        const [day, month, year] = value.split('/').map(Number)
        const date = new Date(year, month - 1, day)
        return date
    }

    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date
}
