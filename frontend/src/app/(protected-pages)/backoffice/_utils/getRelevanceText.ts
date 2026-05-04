import { TRelevance } from '../types'

const getRelevanceText = (
    relevance: TRelevance,
    t: (key: string) => string,
) => {
    switch (relevance) {
        case '-1':
            return t('backOffice.relevance.none')
        case '30':
            return t('backOffice.relevance.30')
        case '60':
            return t('backOffice.relevance.60')
        default:
            return relevance
    }
}

export default getRelevanceText
