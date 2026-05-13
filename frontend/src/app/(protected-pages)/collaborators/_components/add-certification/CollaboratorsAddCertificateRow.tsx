'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    TbFileTypePdf,
    TbPhoto,
    TbTrash,
    TbEye,
    TbReload,
    TbCheck,
} from 'react-icons/tb'
import { useCollaboratorsStore } from '../../_store/collaboratorsStore'
import { TCertificateRow, TCollaboratorCertificate } from '../../types'
import { getUploadUrl } from '@/server/actions/collaborators/get-upload-url'
import { checkCertificateStatus } from '@/server/actions/collaborators/check-certificate-status'
import {
    certificateKeys,
    collaboratorKeys,
} from '@/server/actions/collaborators/collaborator-keys'
import { Button, DatePicker, Input, Notification, toast } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { FaRegSave } from 'react-icons/fa'
import dayjs from 'dayjs'
import { saveCertificate } from '@/server/actions/collaborators/save-collaborator-certificate'
import Loading from '@/components/shared/Loading'
import CooldownRing from './PendingRowCooldownRing'

function encodeKey(key: string): string {
    return btoa(unescape(encodeURIComponent(key)))
}

const MAX_POLL_RETRIES = 40
const POLL_INTERVAL_MS = 3000

const CERTIFICATE_TYPES = [
    'Calificación',
    'Certificación',
    'Certificación CEIM',
    'Curso ACHS',
    'Curso Inatrans',
    'Curso OTEC',
    'Documento Interno',
    'Exámenes',
    'LMS - BHP',
    'Municipal',
    'IRL',
    'Certificado',
    'Licencia Interna',
]

const FileIcon = ({ file }: { file: File }) => {
    const isPdf = file?.type === 'application/pdf'
    return isPdf ? (
        <TbFileTypePdf className="text-red-500 shrink-0" size={20} />
    ) : (
        <TbPhoto className="text-blue-500 shrink-0" size={20} />
    )
}

const SpinnerRow = ({
    file,
    label,
    showTimer = false,
    isLastPollPending = false,
}: {
    file: File
    label: string
    showTimer?: boolean
    isLastPollPending?: boolean
}) => (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 min-h-[52px] relative">
        <div className="w-full absolute inset-0 flex items-center justify-between text-sm text-gray-700 gap-4 filter blur-sm px-4">
            <span>Archivo de prueba</span>
            <span>Certif. de competencias industriales.</span>
            <span>Documento interno</span>
            <span>02-10-2026</span>
            <div className="flex items-center gap-2 ml-12">
                <Button size="xs" variant="solid" disabled>
                    Guardar
                </Button>
                <button>
                    <TbTrash size={16} />
                </button>
            </div>
        </div>
        <div className="flex items-center gap-2 w-[15%] shrink-0 min-w-0 z-10 pr-2">
            <FileIcon file={file} />
            <span className="flex-1 text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                {file?.name}
            </span>
        </div>
        <div className="flex items-center gap-3 justify-center w-full z-10">
            <Button size="xs" variant="default" loading={true}>
                <span>{label}</span>
            </Button>
            {showTimer && (
                <CooldownRing
                    isLastPollPending={isLastPollPending}
                    pollIntervalMs={POLL_INTERVAL_MS}
                    maxPollRetries={MAX_POLL_RETRIES}
                />
            )}
        </div>
    </div>
)

interface Props {
    row: TCertificateRow
    collaboratorId: string
}

const CollaboratorsAddCertificationCertificateRow = ({
    row,
    collaboratorId,
}: Props) => {
    const t = useTranslation()
    const queryClient = useQueryClient()
    const updateRow = useCollaboratorsStore((s) => s.updateCertificateRow)
    const removeRow = useCollaboratorsStore((s) => s.removeCertificateRow)
    const setSelectedCertificate = useCollaboratorsStore(
        (s) => s.setSelectedCertificate,
    )

    const isProcessingAll = useCollaboratorsStore((s) => s.isProcessingAll)
    const wasProcessingAllRef = useRef(false)

    const triggerSaveAll = useCollaboratorsStore((s) => s.triggerSaveAll)
    const lastSaveTriggerRef = useRef(0)

    const pollCountRef = useRef(0)
    const [isPollingActive, setIsPollingActive] = useState(false)
    const [isLastPollPending, setIsLastPollPending] = useState(false)

    const [editedData, setEditedData] = useState<
        Partial<TCollaboratorCertificate>
    >(row.editedData ?? {})

    const [isEditingName, setIsEditingName] = useState(false)
    const [isEditingType, setIsEditingType] = useState(false)
    const [isEditingCode, setIsEditingCode] = useState(false)

    const hasChanges = useMemo(() => {
        if (!row.originalData) return false
        return (
            Object.keys(editedData) as (keyof TCollaboratorCertificate)[]
        ).some((key) => editedData[key] !== row.originalData?.[key])
    }, [editedData, row.originalData])

    const prevHasChangesRef = useRef<boolean | undefined>(undefined)
    useEffect(() => {
        if (row.status !== 'processed') return
        if (hasChanges !== prevHasChangesRef.current) {
            prevHasChangesRef.current = hasChanges
            updateRow(row.tempId, { hasChanges })
        }
    }, [hasChanges, row.status, row.tempId, updateRow])

    useEffect(() => {
        if (row.originalData) {
            setEditedData((prev) => {
                if (Object.keys(prev).length === 0) {
                    return { ...row.originalData }
                }
                return prev
            })
        }
    }, [row.originalData])

    useEffect(() => {
        if (row.status === 'processing' && row.hash) {
            pollCountRef.current = 0
            setIsPollingActive(true)
            setIsLastPollPending(false)
        }
    }, [row.status, row.hash])

    const processMutation = useMutation({
        mutationFn: async () => {
            const result = await getUploadUrl(
                row.file.name,
                row.file.type,
                collaboratorId,
            )
            if (!result.success || !result.presignedUrl) {
                throw new Error(
                    result.error ?? 'Error al obtener permiso de subida',
                )
            }
            const uploadResponse = await fetch(result.presignedUrl, {
                method: 'PUT',
                body: row.file,
                headers: { 'Content-Type': row.file.type },
            })
            if (!uploadResponse.ok) {
                throw new Error('Error al subir el archivo a S3')
            }
            return result.fileKey as string
        },
        onMutate: () => {
            updateRow(row.tempId, { status: 'uploading' })
        },
        onSuccess: (fileKey) => {
            const hash = encodeKey(fileKey)
            updateRow(row.tempId, { status: 'processing', fileKey, hash })
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
            updateRow(row.tempId, {
                status: 'error',
                errorMessage: (err as Error).message,
            })
            toast.push(
                <Notification
                    title={t(
                        'collaborators.addCertification.certificatesTable.uploadErrorTitle',
                    )}
                    type="danger"
                />,
            )
        },
    })

    useEffect(() => {
        if (isProcessingAll && !wasProcessingAllRef.current) {
            wasProcessingAllRef.current = true
            if (
                (row.status === 'uploaded' || row.status === 'error') &&
                !processMutation.isPending
            ) {
                processMutation.mutate()
            }
        }
        if (!isProcessingAll) {
            wasProcessingAllRef.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isProcessingAll, row.status])

    const { data: statusData, dataUpdatedAt } = useQuery({
        queryKey: certificateKeys.status(row.hash ?? ''),
        queryFn: async () => {
            const result = await checkCertificateStatus(row.hash!)

            if (!result.success) {
                throw new Error(result.error)
            }

            return result.data
        },
        enabled: isPollingActive && row.status === 'processing' && !!row.hash,
        refetchInterval: isPollingActive ? POLL_INTERVAL_MS : false,
        staleTime: 0,
    })

    useEffect(() => {
        if (!statusData || !isPollingActive) return

        if (statusData.found) {
            setIsPollingActive(false)
            setIsLastPollPending(false)
            updateRow(row.tempId, {
                status: 'processed',
                originalData: statusData.data,
            })
            return
        }

        pollCountRef.current += 1

        if (pollCountRef.current >= MAX_POLL_RETRIES) {
            setIsPollingActive(false)
            setIsLastPollPending(false)
            updateRow(row.tempId, {
                status: 'error',
                errorMessage: t(
                    'collaborators.addCertification.certificatesTable.errors.timeout',
                ),
            })
            return
        }

        if (pollCountRef.current >= MAX_POLL_RETRIES - 1) {
            setIsLastPollPending(true)
        }
    }, [dataUpdatedAt, isPollingActive, statusData, row.tempId, updateRow, t])

    const saveMutation = useMutation({
        mutationFn: async () => {
            const response = await saveCertificate(collaboratorId, {
                name: editedData.name ?? row.originalData?.name ?? '',
                code: editedData.code ?? row.originalData?.code ?? '',
                type: editedData.type ?? row.originalData?.type ?? '',
                expiredAt: editedData.expiredAt ?? row.originalData?.expiredAt,
                institution:
                    editedData.institution ??
                    row.originalData?.institution ??
                    '',
                tags: editedData.tags ?? row.originalData?.tags ?? [],
                description:
                    editedData.description ??
                    row.originalData?.description ??
                    '',
                createdAt: editedData?.createdAt ?? row.originalData?.createdAt,
                key: row.fileKey ?? '',
            })
            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            updateRow(row.tempId, {
                isSaved: true,
                hasChanges: false,
            })
            toast.push(
                <Notification
                    title={t(
                        'collaborators.addCertification.certificatesTable.saveSuccessTitle',
                    )}
                    type="success"
                />,
            )

            await queryClient.invalidateQueries({
                queryKey: collaboratorKeys.singleCollaborator(collaboratorId),
            })
        },
        onError: (err: Error) => {
            toast.push(
                <Notification
                    title={
                        err.message ||
                        t(
                            'collaborators.addCertification.certificatesTable.saveErrorTitle',
                        )
                    }
                    type="danger"
                />,
            )
        },
    })

    useEffect(() => {
        if (triggerSaveAll <= lastSaveTriggerRef.current) return
        lastSaveTriggerRef.current = triggerSaveAll
        if (
            !row.isSaved &&
            !saveMutation.isPending &&
            row.status === 'processed'
        ) {
            saveMutation.mutate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerSaveAll, hasChanges, row.isSaved, row.status])

    const setField = useCallback(
        <K extends keyof TCollaboratorCertificate>(
            key: K,
            value: TCollaboratorCertificate[K],
        ) => setEditedData((prev) => ({ ...prev, [key]: value })),
        [],
    )

    const handleRetry = () => {
        if (row.hash) {
            updateRow(row.tempId, {
                status: 'processing',
                errorMessage: undefined,
            })
        } else {
            processMutation.mutate()
        }
    }

    if (row.status === 'uploading') {
        return (
            <SpinnerRow
                file={row.file}
                label={t(
                    'collaborators.addCertification.certificatesTable.status.uploading',
                )}
            />
        )
    }

    if (row.status === 'processing') {
        return (
            <SpinnerRow
                file={row.file}
                label={t(
                    'collaborators.addCertification.certificatesTable.status.processing',
                )}
                showTimer
                isLastPollPending={isLastPollPending}
            />
        )
    }

    if (row.status === 'uploaded') {
        return (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 min-h-[52px] relative">
                <div className="w-full absolute inset-0 flex items-center justify-between text-sm text-gray-700 gap-4 filter blur-sm px-4">
                    <span>Archivo de prueba</span>
                    <span>Certif. de competencias industriales.</span>
                    <span>Documento interno</span>
                    <span>02-10-2026</span>
                    <div className="flex items-center gap-2 ml-12">
                        <Button size="xs" variant="solid" disabled>
                            Guardar
                        </Button>
                        <button>
                            <TbTrash size={16} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-[15%] shrink-0 min-w-0 z-10 pr-2">
                    <FileIcon file={row.file} />
                    <span className="flex-1 text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                        {row.file?.name}
                    </span>
                </div>
                <div className="flex items-center gap-2 justify-center w-full z-10">
                    <Button
                        size="xs"
                        variant="default"
                        loading={processMutation.isPending}
                        onClick={() => processMutation.mutate()}
                    >
                        {t(
                            'collaborators.addCertification.certificatesTable.actions.process',
                        )}
                    </Button>
                    <button
                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                        onClick={() => removeRow(row.tempId)}
                    >
                        <TbTrash size={16} />
                    </button>
                </div>
            </div>
        )
    }

    if (row.status === 'error') {
        return (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 min-h-[52px] bg-red-50 dark:bg-red-900/10">
                <FileIcon file={row.file} />
                <span className="flex-1 text-sm font-medium truncate text-gray-700 dark:text-gray-200">
                    {row.file?.name}
                </span>
                <span className="text-xs text-red-500 truncate max-w-[400px]">
                    {row.errorMessage ?? t('common.error')}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        onClick={handleRetry}
                        title={t('common.retry')}
                    >
                        <TbReload size={16} />
                    </button>
                    <button
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => removeRow(row.tempId)}
                    >
                        <TbTrash size={16} />
                    </button>
                </div>
            </div>
        )
    }

    if (row.isSaved) {
        return (
            <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 min-h-[52px] bg-green-50/40 dark:bg-green-900/10 opacity-70">
                <div className="flex items-center gap-2 w-[15%] shrink-0 min-w-0 pr-2">
                    <FileIcon file={row.file} />
                    <span
                        className="text-xs text-gray-500 truncate"
                        title={row.file?.name}
                    >
                        {row.file?.name}
                    </span>
                </div>

                <div className="w-[25%] shrink-0 px-2 min-w-0">
                    <span className="text-sm font-medium truncate block w-full text-gray-600 dark:text-gray-300">
                        {editedData.name || (
                            <span className="text-gray-400 italic">—</span>
                        )}
                    </span>
                </div>

                <div className="w-[15%] shrink-0 px-2">
                    <span className="text-sm truncate block w-full text-gray-600 dark:text-gray-300">
                        {editedData.type || (
                            <span className="text-gray-400 italic">—</span>
                        )}
                    </span>
                </div>

                <div className="w-[15%] shrink-0 px-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {editedData.expiredAt
                            ? dayjs(editedData.expiredAt).format('DD/MM/YYYY')
                            : '—'}
                    </span>
                </div>

                <div className="w-[20%] shrink-0 px-2">
                    <span className="text-sm text-gray-500 font-semibold truncate block w-full">
                        {editedData.code ||
                            t(
                                'collaborators.addCertification.certificatesTable.noCertificateId',
                            )}
                    </span>
                </div>

                <div className="w-[10%] shrink-0 flex items-center justify-end gap-3 pl-2">
                    <button
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        onClick={() => {
                            if (row.originalData) {
                                setSelectedCertificate(row.originalData)
                            }
                        }}
                    >
                        <TbEye size={16} />
                    </button>
                    <TbCheck
                        size={16}
                        className="text-green-500"
                        title={t('common.saved')}
                    />
                </div>
            </div>
        )
    }
    return (
        <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 min-h-[52px]">
            <div className="flex items-center gap-2 w-[15%] shrink-0 min-w-0 pr-2">
                <FileIcon file={row.file} />
                <span
                    className="text-xs text-gray-500 truncate"
                    title={row.file?.name}
                >
                    {row.file?.name}
                </span>
            </div>

            <div className="w-[25%] shrink-0 px-2 min-w-0">
                {isEditingName ? (
                    <Input
                        size="xs"
                        autoFocus
                        className="w-full text-sm px-2 py-1 border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                        value={editedData.name ?? ''}
                        onChange={(e) => setField('name', e.target.value)}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape')
                                setIsEditingName(false)
                        }}
                    />
                ) : (
                    <span
                        className="text-sm font-medium cursor-pointer hover:text-blue-500 transition-colors truncate block w-full"
                        title={t(
                            'collaborators.addCertification.certificatesTable.hints.clickToEdit',
                        )}
                        onClick={() => setIsEditingName(true)}
                    >
                        {editedData.name ? (
                            editedData.name
                        ) : (
                            <span className="text-gray-400 italic">
                                {t(
                                    'collaborators.addCertification.certificatesTable.placeholders.name',
                                )}
                            </span>
                        )}
                    </span>
                )}
            </div>

            <div className="w-[15%] shrink-0 px-2">
                {isEditingType ? (
                    <select
                        className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        value={editedData.type ?? ''}
                        onChange={(e) => {
                            setField('type', e.target.value)
                            setIsEditingType(false)
                        }}
                        onBlur={() => setIsEditingType(false)}
                    >
                        <option value="">
                            {t(
                                'collaborators.addCertification.certificatesTable.placeholders.type',
                            )}
                        </option>
                        {CERTIFICATE_TYPES.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span
                        className="text-sm cursor-pointer hover:text-blue-500 transition-colors truncate block w-full"
                        title={t(
                            'collaborators.addCertification.certificatesTable.hints.clickToEdit',
                        )}
                        onClick={() => setIsEditingType(true)}
                    >
                        {editedData.type ? (
                            editedData.type
                        ) : (
                            <span className="text-gray-400 italic">
                                {t(
                                    'collaborators.addCertification.certificatesTable.placeholders.type',
                                )}
                            </span>
                        )}
                    </span>
                )}
            </div>

            <div className="w-[15%] shrink-0 px-2">
                <DatePicker
                    size="xs"
                    type="date"
                    className="w-full text-sm rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={
                        editedData.expiredAt
                            ? dayjs(editedData.expiredAt).toDate()
                            : undefined
                    }
                    onChange={(value) =>
                        setField('expiredAt', dayjs(value).format('YYYY-MM-DD'))
                    }
                />
            </div>

            <div className="w-[20%] shrink-0 px-2">
                {isEditingCode ? (
                    <Input
                        size="xs"
                        autoFocus
                        className="w-full text-sm px-2 py-1 border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100"
                        value={editedData.code ?? ''}
                        onChange={(e) => setField('code', e.target.value)}
                        onBlur={() => setIsEditingCode(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape')
                                setIsEditingCode(false)
                        }}
                    />
                ) : (
                    <span
                        className="text-sm text-gray-500 truncate font-semibold block w-full cursor-pointer hover:text-blue-500 transition-colors"
                        onClick={() => setIsEditingCode(true)}
                    >
                        {editedData.code ||
                            t(
                                'collaborators.addCertification.certificatesTable.noCertificateId',
                            )}
                    </span>
                )}
            </div>

            <div className="w-[10%] shrink-0 flex items-center justify-end gap-3 pl-2">
                <button
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    onClick={() => {
                        if (row.originalData) {
                            setSelectedCertificate(row.originalData)
                        }
                    }}
                >
                    <TbEye size={16} />
                </button>
                <button
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => removeRow(row.tempId)}
                >
                    <TbTrash size={16} />
                </button>
                <button
                    className="disabled:cursor-not-allowed disabled:opacity-50 text-gray-400 transition-colors hover:text-blue-500"
                    disabled={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                >
                    {saveMutation.isPending ? (
                        <div className="w-4 h-4">
                            <Loading loading />
                        </div>
                    ) : (
                        <FaRegSave size={16} />
                    )}
                </button>
            </div>
        </div>
    )
}

export default CollaboratorsAddCertificationCertificateRow
