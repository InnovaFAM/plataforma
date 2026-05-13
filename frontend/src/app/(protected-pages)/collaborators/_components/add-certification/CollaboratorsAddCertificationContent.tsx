'use client'

import { useCallback, useEffect } from 'react'
import { Button } from '@/components/ui'
import classNames from '@/utils/classNames'
import useTranslation from '@/utils/hooks/useTranslation'
import { useQuery } from '@tanstack/react-query'
import { getCollaboratorById } from '@/server/actions/collaborators/get-collaborator-by-id'
import { collaboratorKeys } from '@/server/actions/collaborators/collaborator-keys'
import { useCollaboratorsStore } from '../../_store/collaboratorsStore'
import { TCertificateRow } from '../../types'
import CollaboratorsAddCertificationCertificatesList from './CollaboratorsAddCertificationCertificatesList'
import CollaboratorsAddCertificationCertificateDetails from './CollaboratorsAddCertificationCertificateDetails'
import { useRouter } from 'next/navigation'

interface Props {
    collaboratorId: string
}

const CollaboratorsAddCertificationContent = ({ collaboratorId }: Props) => {
    const t = useTranslation()
    const router = useRouter()

    const addRows = useCollaboratorsStore((s) => s.addCertificateRows)
    const certificateRows = useCollaboratorsStore((s) => s.certificateRows)
    const selectedCertificate = useCollaboratorsStore(
        (s) => s.selectedCertificate,
    )
    const fireProcessAll = useCollaboratorsStore((s) => s.fireProcessAll)
    const fireSaveAll = useCollaboratorsStore((s) => s.fireSaveAll)
    const isProcessingAll = useCollaboratorsStore((s) => s.isProcessingAll)
    const setIsProcessingAll = useCollaboratorsStore(
        (s) => s.setIsProcessingAll,
    )

    const { data: collaboratorData } = useQuery({
        queryKey: collaboratorKeys.singleCollaborator(collaboratorId),
        queryFn: async () => {
            const response = await getCollaboratorById(collaboratorId)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
    })

    useEffect(() => {
        if (!isProcessingAll) return
        const hasActiveRows = certificateRows.some(
            (r) => r.status === 'uploading' || r.status === 'processing',
        )

        const hasUnstartedRows = certificateRows.some(
            (r) => r.status === 'uploaded',
        )
        if (!hasActiveRows && !hasUnstartedRows) {
            setIsProcessingAll(false)
        }
    }, [certificateRows, isProcessingAll, setIsProcessingAll])

    const handleAddFiles = useCallback(
        (files: File[]) => {
            const state = useCollaboratorsStore.getState()
            const existingRows = state.certificateRows
            const deletedSet = new Set(state.deletedFileSignatures)

            const existingSignatures = new Set(
                existingRows.map(
                    (r) =>
                        `${r.file?.name}__${r.file?.size}__${r.file?.lastModified}`,
                ),
            )

            const freshFiles = files.filter((f) => {
                const sig = `${f.name}__${f.size}__${f.lastModified}`
                return !existingSignatures.has(sig) && !deletedSet.has(sig)
            })

            if (freshFiles.length === 0) return

            const newRows: TCertificateRow[] = freshFiles.map((file) => ({
                tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file,
                status: 'uploaded' as const,
            }))

            addRows(newRows)
        },
        [addRows],
    )

    const handleDiscard = () => {
        router.push(`/collaborators/${collaboratorId}`)
    }

    const detailsRow =
        certificateRows.find(
            (r) =>
                r.status === 'processed' &&
                r.originalData?.pk === selectedCertificate?.pk,
        ) ?? certificateRows.find((r) => r.status === 'processed')

    const hasPendingRows = certificateRows.some(
        (r) => r.status === 'uploaded' || r.status === 'error',
    )

    const allRowsProcessed =
        certificateRows.length > 0 &&
        certificateRows.every((r) => r.status === 'processed')

    const allSaved =
        certificateRows.filter((r) => r.status === 'processed').length > 0 &&
        certificateRows
            .filter((r) => r.status === 'processed')
            .every((r) => r.isSaved)

    return (
        <div className="relative flex flex-col min-h-[calc(100vh)] gap-4 w-full mt-4">
            <div className="flex-grow">
                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    <div className="flex flex-col gap-4 flex-1 min-w-0 w-full">
                        <CollaboratorsAddCertificationCertificatesList
                            collaborator={collaboratorData}
                            collaboratorId={collaboratorId}
                            onAddFiles={handleAddFiles}
                            isProcessingAll={isProcessingAll}
                        />
                    </div>

                    {detailsRow?.originalData && (
                        <div className="flex flex-col gap-4 w-full xl:w-[400px] 2xl:w-[500px] shrink-0">
                            <CollaboratorsAddCertificationCertificateDetails
                                certificate={detailsRow.originalData}
                                tempId={detailsRow.tempId}
                                file={detailsRow.file}
                                isSaved={detailsRow.isSaved}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="sticky bottom-0 left-0 bg-white dark:bg-gray-900 flex items-center justify-between py-4 px-8 border-t border-gray-200 z-40 -mx-4 lg:-mx-8 w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                <div />
                <div className="flex gap-2">
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
                        onClick={() => {
                            handleDiscard()
                        }}
                    >
                        {allSaved ? 'Salir' : t('common.cancel')}
                    </Button>

                    {!allRowsProcessed && (
                        <Button
                            variant="solid"
                            loading={isProcessingAll}
                            disabled={!hasPendingRows || isProcessingAll}
                            onClick={fireProcessAll}
                        >
                            {t('collaborators.addCertification.processAll')}
                        </Button>
                    )}

                    {allRowsProcessed && (
                        <Button
                            variant="solid"
                            disabled={allSaved}
                            onClick={fireSaveAll}
                        >
                            {t('collaborators.addCertification.saveAll')}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CollaboratorsAddCertificationContent
