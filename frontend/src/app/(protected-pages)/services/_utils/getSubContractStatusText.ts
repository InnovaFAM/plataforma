import { TSubContractManager } from '../types'

const getSubContractStatusText = (
    status: TSubContractManager['status'],
    t: (key: string) => string,
) => {
    switch (status) {
        case 'active':
            return t('services.subContract.status.active')
        case 'inactive':
            return t('services.subContract.status.inactive')
    }
    return status
}

export default getSubContractStatusText
