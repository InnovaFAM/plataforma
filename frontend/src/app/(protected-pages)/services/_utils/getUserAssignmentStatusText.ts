import { TranslationFn } from '@/@types/navigation'

const getUserAssignmentStatusText = (status: string, t: TranslationFn) => {
    switch (status) {
        case 'confirmed':
            return t('services.assignmentStatus.confirmed')
        case 'proposed':
            return t('services.assignmentStatus.proposed')
        default:
            return status
    }
}

export default getUserAssignmentStatusText
