import { TranslationFn } from '@/@types/navigation'

const getUserAvailabilityText = (evaluation: number, t: TranslationFn) => {
    if (evaluation > 0) return evaluation

    return t('services.collabEvaluation.unavailable')
}

export default getUserAvailabilityText
