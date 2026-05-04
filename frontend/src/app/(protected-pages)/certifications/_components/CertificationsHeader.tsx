import useTranslation from '@/utils/hooks/useTranslation'

const CertificationsHeader = () => {
    const t = useTranslation()

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <h3>{t('certifications.header.title')}</h3>
            </div>
        </>
    )
}

export default CertificationsHeader
