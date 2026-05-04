const getStatusText = (status: string, t: (key: string) => string) => {
    switch (status) {
        case 'active':
            return t('backOffice.status.active')
        case 'inactive':
            return t('backOffice.status.inactive')
        default:
            return status
    }
}

export default getStatusText
