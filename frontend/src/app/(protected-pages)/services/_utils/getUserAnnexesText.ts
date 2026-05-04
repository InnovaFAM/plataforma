import { TranslationFn } from '@/@types/navigation'

const getUserAnnexesText = (annex: boolean, t: TranslationFn) => {
    if (annex) return t('services.annexesStatus.active')

    return t('services.annexesStatus.inactive')
}

export default getUserAnnexesText
