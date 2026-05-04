const getStatusText = (status: string, t: (key: string) => string) => {
    switch (status) {
        case 'active':
            return t('collaborators.status.active')
        case 'inactive':
            return t('collaborators.status.inactive')
        default:
            return status
    }
}

export default getStatusText
