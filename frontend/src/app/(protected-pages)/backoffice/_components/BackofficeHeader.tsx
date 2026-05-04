import useTranslation from '@/utils/hooks/useTranslation'

const BackOfficeHeader = () => {
    const t = useTranslation()

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
                <h3>{t('backOffice.header.title')}</h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
                {t('backOffice.header.description')}
            </p>
        </div>
    )
}

export default BackOfficeHeader
