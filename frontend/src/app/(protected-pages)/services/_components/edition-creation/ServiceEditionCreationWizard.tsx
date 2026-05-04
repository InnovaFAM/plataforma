'use client'
import Steps from '@/components/ui/Steps'
import useTranslation from '@/utils/hooks/useTranslation'

interface EditionCreationWizardProps {
    currentStep: number
}

const STEPS = [
    {
        title: 'services.creation.steps.basicInformation',
        description: 'services.creation.steps.basicInformationDescription',
    },
    {
        title: 'services.creation.steps.contractsAndRoles',
        description: 'services.creation.steps.contractsAndRolesDescription',
    },
    {
        title: 'services.creation.steps.preview',
        description: 'services.creation.steps.previewDescription',
    },
]

const EditionCreationWizard = ({ currentStep }: EditionCreationWizardProps) => {
    const t = useTranslation()
    return (
        <div className="flex justify-between">
            <Steps vertical current={currentStep}>
                {STEPS.map((step, index) => (
                    <Steps.Item
                        key={index}
                        title={t(step.title)}
                        description={t(step.description)}
                    />
                ))}
            </Steps>
        </div>
    )
}

export default EditionCreationWizard
