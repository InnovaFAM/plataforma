import { useState } from 'react'
import { Upload } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { PiImagesLight } from 'react-icons/pi'

interface CollaboratorsAddCertificationUploadCardProps {
    setFiles: (files: File[] | null) => void
}

const CollaboratorsAddCertificationUploadCard = ({
    setFiles,
}: CollaboratorsAddCertificationUploadCardProps) => {
    const t = useTranslation()
    const [error, setError] = useState<string | null>(null)

    const MAX_FILE_SIZE_MB = 4
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

    return (
        <div>
            <h4 className="font-bold">
                {t('collaborators.addCertification.uploadCard.title')}
            </h4>
            <h6 className="text-sm mt-2 mb-4 text-gray-500 dark:text-white">
                {t('collaborators.addCertification.uploadCard.description')}
            </h6>

            <Upload
                draggable
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                showList={false}
                onChange={(files) => {
                    setError(null)

                    if (files && files.length > 0) {
                        const validFiles = files.filter(
                            (file) => file.size <= MAX_FILE_SIZE_BYTES,
                        )
                        if (!validFiles.length) {
                            setError(
                                t(
                                    'collaborators.addCertification.uploadCard.noValidFiles',
                                ),
                            )
                        }
                        setFiles(validFiles.length > 0 ? validFiles : null)
                    } else {
                        setFiles(null)
                    }
                }}
            >
                <div className="my-16 text-center">
                    <div className="text-6xl mb-4 flex justify-center">
                        <PiImagesLight />
                    </div>
                    <div className="flex flex-col gap-1 items-center mb-2 font-medium">
                        <span className="text-blue-500">
                            {t(
                                'collaborators.addCertification.uploadCard.browse',
                            )}
                        </span>
                    </div>
                </div>
            </Upload>

            <p className="mt-1 text-gray-500 dark:text-white">
                {t('collaborators.addCertification.uploadCard.support', {
                    value: MAX_FILE_SIZE_MB,
                })}
            </p>

            {error && (
                <p className="mt-2 text-red-500 text-sm font-medium">{error}</p>
            )}
        </div>
    )
}

export default CollaboratorsAddCertificationUploadCard
