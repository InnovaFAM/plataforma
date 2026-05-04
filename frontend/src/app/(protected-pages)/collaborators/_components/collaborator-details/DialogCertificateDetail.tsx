import { Dialog } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import Loading from '@/components/shared/Loading'
import { TCollaboratorCertificate } from '../../types'

type DialogCertificateDetailProps = {
    isOpen: boolean
    selectedCertification: TCollaboratorCertificate | null
    presignedUrl: string | null
    handleModalClose: () => void
}

const DialogCertificateDetail = ({
    isOpen,
    selectedCertification,
    presignedUrl,
    handleModalClose,
}: DialogCertificateDetailProps) => {
    const t = useTranslation()
    return (
        <Dialog
            isOpen={isOpen && Boolean(selectedCertification)}
            onClose={handleModalClose}
            onRequestClose={handleModalClose}
            className="min-w-[50vw]"
        >
            <h4 className="text-xl font-extrabold text-black mb-2">
                {t('collaborators.details.certificationDetails')}
            </h4>
            <h6 className="font-bold text-gray-700 mb-4">
                {selectedCertification?.name || ''}
            </h6>
            {!presignedUrl ? (
                <div className="w-full h-[70vh] flex items-center justify-center bg-gray-50 rounded-lg">
                    <Loading loading={true} />
                    <span className="ml-2 text-gray-500">
                        Cargando documento...
                    </span>
                </div>
            ) : (
                <iframe
                    src={presignedUrl}
                    className="w-full h-[70vh] border-0 rounded-lg"
                />
            )}
        </Dialog>
    )
}

export default DialogCertificateDetail
