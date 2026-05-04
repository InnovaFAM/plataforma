import { TranslationFn } from '@/@types'

export const translateError = (error: string, t: TranslationFn) => {
    const errorTranslations: Record<string, string> = {
        'Client with this RUT already exists': t(
            'backOffice.clientModal.errors.duplicateRut',
        ),
    }
    return errorTranslations[error] || error
}
