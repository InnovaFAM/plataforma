const getStatusText = (status: string, t: (key: string) => string) => {
    switch (status) {
        case 'active':
            return t('rolesUsers.status.active')
        case 'inactive':
            return t('rolesUsers.status.inactive')
        case '':
            return t('rolesUsers.status.all')
        default:
            return ''
    }
}

export default getStatusText
