import { TMatrix } from '../types'

const getMatrixText = (matrix: TMatrix, t: (key: string) => string) => {
    switch (matrix) {
        case 'Cargo':
            return t('backOffice.matrix.cargo')
        case 'Global':
            return t('backOffice.matrix.global')
        case 'Faena':
            return t('backOffice.matrix.faena')
        default:
            return matrix
    }
}

export default getMatrixText
