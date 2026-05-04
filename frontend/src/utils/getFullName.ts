export const getFullName = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return ''
    if (!firstName) return lastName || ''
    if (!lastName) return firstName
    return `${firstName} ${lastName}`
}
