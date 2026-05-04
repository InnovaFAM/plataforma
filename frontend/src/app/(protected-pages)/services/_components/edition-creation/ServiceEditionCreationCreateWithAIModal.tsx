import { useEffect, useRef, useState } from 'react'
import { Button, Dialog, toast, Upload, Notification } from '@/components/ui'
import classNames from '@/utils/classNames'
import useTranslation from '@/utils/hooks/useTranslation'
import { PiImagesLight } from 'react-icons/pi'
import AIThinkingOrbit, {
    AIThinkingPhase,
} from './ServiceEditionCreationAIThinkingOrbit'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getEncodeKey } from '@/utils/getEncodeKey'
import { getUploadUrl } from '@/server/actions/services/get-upload-url'
import { checkServiceStatus } from '@/server/actions/checks/checks-actions'
import { checkKeys } from '@/server/actions/checks/checks-keys'
import { TDetailedService } from '../../types'
import { useServicesStore } from '../../_store/servicesStore'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'

interface ServiceEditionCreationCreateWithAIModalProps {
    open: boolean
    onSuccess: (service: TDetailedService) => void
    onClose: () => void
}

const MOCK_COMPLETED_COUNT = 12

const ServiceEditionCreationCreateWithAIModal = ({
    open,
    onSuccess,
    onClose,
}: ServiceEditionCreationCreateWithAIModalProps) => {
    const t = useTranslation()
    const { protectedQueryFn } = useProtectedQueryFn()

    const upsertRolesToCreate = useServicesStore(
        (state) => state.upsertRolesToCreate,
    )
    const [file, setFile] = useState<File | null>(null)
    const [hash, setHash] = useState<string | null>(null)

    const [aiPhase, setAiPhase] = useState<AIThinkingPhase>('idle')
    const [completedCount] = useState(MOCK_COMPLETED_COUNT)

    const isLoading = aiPhase === 'loading'
    const isSuccess = aiPhase === 'success'
    const showAnimation = aiPhase !== 'idle'

    const { data } = useQuery({
        queryKey: checkKeys.service(hash ?? ''),
        queryFn: async () => protectedQueryFn(() => checkServiceStatus(hash!)),
        enabled: isLoading && !!hash,
        refetchInterval: isLoading ? 3000 : false,
        staleTime: 0,
    })

    const statusData = data?.data

    const processMutation = useMutation({
        mutationFn: async () => {
            const result = await getUploadUrl(
                file?.name || 'service_to_process',
                file?.type || 'application/pdf',
            )
            if (!result.success || !result.presignedUrl) {
                throw new Error(
                    result.error ?? 'Error al obtener permiso de subida',
                )
            }
            const uploadResponse = await fetch(result.presignedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file?.type || 'application/pdf' },
            })
            if (!uploadResponse.ok) {
                throw new Error('Error al subir el archivo a S3')
            }
            return result.fileKey as string
        },
        onSuccess: (fileKey) => {
            const hash = getEncodeKey(fileKey)
            setHash(hash)
            toast.push(
                <Notification
                    title={t(
                        'collaborators.addCertification.certificatesTable.uploadSuccessTitle',
                    )}
                    type="success"
                />,
            )
        },
        onError: (err) => {
            toast.push(
                <Notification
                    title={
                        String(err) ??
                        t(
                            'collaborators.addCertification.certificatesTable.uploadErrorTitle',
                        )
                    }
                    type="danger"
                />,
            )
        },
    })

    const handleCreate = () => {
        setAiPhase('loading')
        processMutation.mutate()
    }

    const handleClose = () => {
        if (isLoading) return
        setFile?.(null)
        setAiPhase('idle')
        onClose()
    }

    const handleRemoveFile = () => {
        setAiPhase('idle')
        setFile?.(null)
    }

    useEffect(() => {
        if (!statusData || !isLoading) return

        if (statusData.found) {
            setAiPhase('success')
            const tempService = statusData.data
            upsertRolesToCreate(tempService?.roles || [])
            delete tempService?.roles
            delete tempService?.pk
            delete tempService?.ttl
            onSuccess(tempService as TDetailedService)
            return
        }
    }, [statusData, upsertRolesToCreate, isLoading, onSuccess])

    return (
        <Dialog
            isOpen={open}
            onClose={handleClose}
            onRequestClose={handleClose}
            className="min-w-[50vw] flex flex-col p-6"
            contentClassName="min-h-[50vh]"
        >
            <h4 className="font-bold">
                {t('services.creation.createWithAiModal.title')}
            </h4>
            <h6 className="text-sm mt-2 mb-4 text-gray-500 dark:text-white">
                {t('services.creation.createWithAiModal.description')}
            </h6>

            {!file && !showAnimation && (
                <>
                    <Upload
                        draggable
                        accept=".pdf"
                        onChange={(files) => {
                            if (files && files[0]) {
                                setFile?.(files[0])
                            }
                        }}
                    >
                        <div className="my-16 text-center">
                            <div className="text-6xl mb-4 flex justify-center">
                                <PiImagesLight />
                            </div>
                            <div className="flex flex-col gap-1 items-center mb-2 font-medium">
                                <span className="text-gray-800 dark:text-white">
                                    {t(
                                        'services.creation.createWithAiModal.dropHereOr',
                                    )}
                                </span>
                                <span className="text-blue-500">
                                    {t(
                                        'services.creation.createWithAiModal.browse',
                                    )}
                                </span>
                            </div>
                        </div>
                    </Upload>
                    <p className="mt-1 text-gray-500 dark:text-white">
                        {t('services.creation.createWithAiModal.support')}
                    </p>
                </>
            )}

            {file && !showAnimation && (
                <div className="flex flex-col gap-4">
                    <h5 className="font-semibold">{file.name}</h5>
                    <iframe
                        src={URL.createObjectURL(file)}
                        title="File Preview"
                        className="w-full h-96 border"
                    />
                    <div className="flex w-full justify-around items-center">
                        <Button
                            variant="default"
                            customColorClass={({ active }) =>
                                classNames(
                                    'border-red-400 hover:text-red-600 dark:hover:bg-red-500 hover:ring-0',
                                    active
                                        ? 'bg-red-50 text-red-500 border-red-500'
                                        : 'text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-500',
                                )
                            }
                            onClick={handleRemoveFile}
                        >
                            {t(
                                'services.creation.createWithAiModal.removeFile',
                            )}
                        </Button>
                        <Button
                            variant="solid"
                            className="w-max self-end"
                            onClick={handleCreate}
                        >
                            {t('services.creation.createWithAiModal.create')}
                        </Button>
                    </div>
                </div>
            )}

            {showAnimation && (
                <div className="relative flex-1 flex flex-col">
                    <AIThinkingOrbit
                        phase={aiPhase}
                        completedCount={completedCount}
                    />

                    {isSuccess && (
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="solid"
                                className="w-max"
                                onClick={handleClose}
                            >
                                {t(
                                    'services.creation.createWithAiModal.confirm',
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Dialog>
    )
}

export default ServiceEditionCreationCreateWithAIModal
