const getContractAdminTypeText = (
    type: 'cliente' | 'fam',
    t: (key: string) => string,
): string => {
    if (!type) return ''

    switch (type) {
        case 'cliente':
            return t('services.details.contractAdminType.client')
        case 'fam':
            return t('services.details.contractAdminType.fam')
        default:
            return type
    }
}

export default getContractAdminTypeText
