import useTranslation from '@/utils/hooks/useTranslation'

const CollaboratorsAddCertificationHeader = () => {
    const t = useTranslation()

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <h3>{t('collaborators.header.addCertificationsTitle')}</h3>
            </div>
        </>
    )
}

export default CollaboratorsAddCertificationHeader
