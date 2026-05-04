'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Button, Upload } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TCollaboratorEntity } from '../../types'
import { useCollaboratorsStore } from '../../_store/collaboratorsStore'
import CollaboratorsAddCertificationCertificateRow from './CollaboratorsAddCertificateRow'

interface Props {
    collaborator?: TCollaboratorEntity
    collaboratorId: string
    onAddFiles: (files: File[]) => void
    isProcessingAll: boolean
}

const CollaboratorsAddCertificationCertificatesList = ({
    collaborator,
    collaboratorId,
    onAddFiles,
    isProcessingAll,
}: Props) => {
    const t = useTranslation()
    const rows = useCollaboratorsStore((s) => s.certificateRows)

    const hasProcessedRows = rows.some((r) => r.status === 'processed')

    return (
        <AdaptiveCard className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h4 className="text-lg font-semibold mb-1">
                        {t(
                            'collaborators.addCertification.certificatesTable.title',
                        )}
                    </h4>
                    <p className="text-sm text-gray-400">
                        {t(
                            'collaborators.addCertification.certificatesTable.description',
                            {
                                name: collaborator?.name ?? '',
                            },
                        )}
                    </p>
                </div>
                <Upload
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    showList={false}
                    disabled={isProcessingAll}
                    onChange={(files) => onAddFiles(files)}
                >
                    <Button size="sm" disabled={isProcessingAll}>
                        {t(
                            'collaborators.addCertification.certificatesTable.uploadButton',
                        )}
                    </Button>
                </Upload>
            </div>

            {rows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400 text-sm gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <span>
                        {t(
                            'collaborators.addCertification.certificatesTable.empty',
                        )}
                    </span>
                </div>
            )}

            {rows.length > 0 && (
                <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-x-auto">
                    <div className="min-w-[800px]">
                        {hasProcessedRows && (
                            <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <div className="w-[15%] shrink-0">
                                    {t(
                                        'collaborators.addCertification.certificatesTable.columns.file',
                                    )}
                                </div>
                                <div className="w-[25%] shrink-0 px-2">
                                    {t(
                                        'collaborators.addCertification.certificatesTable.columns.name',
                                    )}
                                </div>
                                <div className="w-[15%] shrink-0 px-2">
                                    {t(
                                        'collaborators.addCertification.certificatesTable.columns.type',
                                    )}
                                </div>
                                <div className="w-[15%] shrink-0 px-2">
                                    {t(
                                        'collaborators.addCertification.certificatesTable.columns.expiresAt',
                                    )}
                                </div>
                                <div className="w-[20%] shrink-0 px-2">
                                    {t(
                                        'collaborators.addCertification.certificatesTable.columns.code',
                                    )}
                                </div>
                                <div className="w-[10%] shrink-0 text-right">
                                    {t(
                                        'collaborators.addCertification.certificatesTable.columns.actions',
                                    )}
                                </div>
                            </div>
                        )}

                        {rows.map((row) => (
                            <CollaboratorsAddCertificationCertificateRow
                                key={row.tempId}
                                row={row}
                                collaboratorId={collaboratorId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </AdaptiveCard>
    )
}

export default CollaboratorsAddCertificationCertificatesList
