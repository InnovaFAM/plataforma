'use client'

import { useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { TCollaboratorCertificate } from '../../types'
import useTranslation from '@/utils/hooks/useTranslation'
import { TbPlus, TbTrash } from 'react-icons/tb'
import { useCollaboratorsStore } from '../../_store/collaboratorsStore'
import { Input } from '@/components/ui'

interface Props {
    certificate: TCollaboratorCertificate
    tempId: string
    file: File
    isSaved?: boolean
}

const CollaboratorsAddCertificationCertificateDetails = ({
    certificate,
    tempId,
    file,
    isSaved,
}: Props) => {
    const t = useTranslation()
    const updateRow = useCollaboratorsStore((s) => s.updateCertificateRow)

    const [isAddingTag, setIsAddingTag] = useState(false)
    const [newTagValue, setNewTagValue] = useState('')
    const [isEditingInstitution, setIsEditingInstitution] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)

    const previewUrl = useMemo(
        () => (file ? URL.createObjectURL(file) : undefined),
        [file],
    )
    const isPdf = file?.type === 'application/pdf'

    const updateCertificateData = (
        partial: Partial<TCollaboratorCertificate>,
    ) => {
        updateRow(tempId, {
            originalData: { ...certificate, ...partial },
        })
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const trimmed = newTagValue.trim()
            if (!trimmed) return
            updateCertificateData({
                tags: [...(certificate.tags ?? []), trimmed],
            })
            setNewTagValue('')
            setIsAddingTag(false)
        } else if (e.key === 'Escape') {
            setNewTagValue('')
            setIsAddingTag(false)
        }
    }

    const handleDeleteTag = (indexToRemove: number) => {
        updateCertificateData({
            tags: certificate.tags?.filter((_, i) => i !== indexToRemove) ?? [],
        })
    }

    return (
        <AdaptiveCard>
            <h4 className="text-lg font-semibold mb-4">
                {t('collaborators.addCertification.certificateDetails.title')}
            </h4>

            {previewUrl &&
                (isPdf ? (
                    <div className="relative flex">
                        <button
                            className="z-10 absolute inset-0 flex items-center justify-center bg-black/0 text-transparent hover:text-white font-bold hover:bg-black/20 transition-opacity rounded-xl"
                            onClick={() => window.open(previewUrl, '_blank')}
                        >
                            {t(
                                'collaborators.addCertification.certificateDetails.viewFile',
                            )}
                        </button>
                        <iframe
                            src={previewUrl}
                            title="PDF Preview"
                            className="w-full h-64 border rounded-xl filter blur-lg"
                        />
                    </div>
                ) : (
                    <div className="relative flex">
                        <button
                            className="z-10 absolute inset-0 flex items-center justify-center bg-black/0 text-transparent hover:text-white font-bold hover:bg-black/20 transition-opacity rounded-xl"
                            onClick={() => window.open(previewUrl, '_blank')}
                        >
                            {t(
                                'collaborators.addCertification.certificateDetails.viewFile',
                            )}
                        </button>
                        <img
                            src={previewUrl}
                            alt="Certificate Preview"
                            className="max-w-full max-h-64 object-contain rounded-lg"
                        />
                    </div>
                ))}

            <h4 className="text-lg font-semibold mt-4 uppercase">
                {t('collaborators.addCertification.certificateDetails.summary')}
            </h4>

            {!isSaved && isEditingDescription ? (
                <Input
                    textArea
                    autoFocus
                    rows={4}
                    className="text-sm text-gray-500 px-2 py-1 resize-none rounded"
                    value={certificate.description ?? ''}
                    onChange={(e) =>
                        updateCertificateData({ description: e.target.value })
                    }
                    onBlur={() => setIsEditingDescription(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setIsEditingDescription(false)
                    }}
                />
            ) : (
                <span
                    className={`text-gray-500 mt-2 block ${!isSaved ? 'cursor-pointer hover:text-blue-500 transition-colors' : ''}`}
                    title={
                        !isSaved
                            ? t(
                                  'collaborators.addCertification.certificatesTable.hints.clickToEdit',
                              )
                            : undefined
                    }
                    onClick={() => {
                        if (!isSaved) setIsEditingDescription(true)
                    }}
                >
                    {certificate.description ||
                        t(
                            'collaborators.addCertification.certificateDetails.noDescription',
                        )}
                </span>
            )}

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            <h4 className="text-lg font-semibold uppercase">
                {t(
                    'collaborators.addCertification.certificateDetails.institution',
                )}
            </h4>

            {!isSaved && isEditingInstitution ? (
                <Input
                    size="xs"
                    autoFocus
                    type="text"
                    className="mt-2 w-full text-sm text-gray-500 rounded"
                    value={certificate.institution ?? ''}
                    onChange={(e) =>
                        updateCertificateData({ institution: e.target.value })
                    }
                    onBlur={() => setIsEditingInstitution(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape')
                            setIsEditingInstitution(false)
                    }}
                />
            ) : (
                <span
                    className={`text-gray-500 mt-2 block ${!isSaved ? 'cursor-pointer hover:text-blue-500 transition-colors' : ''}`}
                    title={
                        !isSaved
                            ? t(
                                  'collaborators.addCertification.certificatesTable.hints.clickToEdit',
                              )
                            : undefined
                    }
                    onClick={() => {
                        if (!isSaved) setIsEditingInstitution(true)
                    }}
                >
                    {certificate.institution ||
                        t(
                            'collaborators.addCertification.certificateDetails.noInstitution',
                        )}
                </span>
            )}

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            <h4 className="text-lg font-semibold uppercase">
                {t('collaborators.addCertification.certificateDetails.tags')}
            </h4>

            <div className="flex flex-wrap items-center gap-2 mt-3">
                {certificate.tags?.map((tag, index) => (
                    <span
                        key={index}
                        className={`group flex items-center gap-1 px-3 py-1 text-gray-700 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 text-sm transition-colors ${
                            !isSaved ? 'hover:border-red-400' : ''
                        }`}
                    >
                        {tag}
                        {!isSaved && (
                            <TbTrash
                                className="cursor-pointer text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                                size={14}
                                onClick={() => handleDeleteTag(index)}
                            />
                        )}
                    </span>
                ))}

                {!isSaved &&
                    (isAddingTag ? (
                        <Input
                            size="xs"
                            autoFocus
                            type="text"
                            className="px-3 py-1 text-gray-700 dark:text-gray-100 dark:bg-gray-800 rounded border border-blue-500 text-sm outline-none w-28 focus:ring-1 focus:ring-blue-500"
                            value={newTagValue}
                            onChange={(e) => setNewTagValue(e.target.value)}
                            onKeyDown={handleAddTag}
                            onBlur={() => {
                                setIsAddingTag(false)
                                setNewTagValue('')
                            }}
                        />
                    ) : (
                        <span
                            onClick={() => setIsAddingTag(true)}
                            className="px-3 py-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded border border-dashed border-gray-400 hover:border-gray-600 text-sm flex items-center cursor-pointer transition-colors"
                        >
                            <TbPlus className="mr-1" />
                            {t('common.add')}
                        </span>
                    ))}
            </div>
        </AdaptiveCard>
    )
}

export default CollaboratorsAddCertificationCertificateDetails
