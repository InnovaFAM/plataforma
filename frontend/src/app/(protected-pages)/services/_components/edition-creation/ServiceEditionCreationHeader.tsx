import useTranslation from '@/utils/hooks/useTranslation'

interface CreateEditServiceHeaderProps {
    mode: 'create' | 'edit'
}
const CreateEditServiceHeader = ({ mode }: CreateEditServiceHeaderProps) => {
    const t = useTranslation()

    return (
            <div className="flex items-center justify-between gap-4 pt-4">
                <h3>
                    {mode === 'create'
                        ? t('services.header.create')
                        : t('services.header.edit')}
                </h3>
            </div>
    )
}

export default CreateEditServiceHeader
