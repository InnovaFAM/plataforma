'use client'

import { useMemo, useState, useCallback } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import {
    Button,
    Checkbox,
    Dialog,
    Spinner,
    Tooltip,
    toast,
    Notification,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TbPencil, TbX } from 'react-icons/tb'
import { FaRegSave } from 'react-icons/fa'
import dayjs from 'dayjs'
import { TCertificate, TRoleCertificationsResponse } from '../types'
import { useCertificationsMatrixStore } from '../_store/certificationsStore'
import { addRoleToMatrix } from '@/server/actions/certifications/add-role-to-matrix'
import { removeRoleFromMatrix } from '@/server/actions/certifications/remove-role-from-matrix'
import { useQueryClient } from '@tanstack/react-query'
import { certificationKeys } from '@/server/actions/certifications/certification-keys'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { useCan } from '@/hooks/useCan'
interface RoleCertificationsTableProps {
    data?: TRoleCertificationsResponse
    isLoadingData?: boolean
}

const stripPrefix = (sk: string) => sk.substring(sk.indexOf('#') + 1)

const RoleCertificationsTable = ({
    data,
    isLoadingData,
}: RoleCertificationsTableProps) => {
    const t = useTranslation()
    const canEdit = useCan('certifications:edit')
    const queryClient = useQueryClient()
    const { session } = useCurrentSession()

    const [editMode, setEditMode] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [isLoading, setIsLoading] = useState(false)
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
    const [failedKeys, setFailedKeys] = useState<Set<string>>(new Set())

    const {
        tempRoleMatrix: tempMatrix,
        initRoleMatrix: initMatrix,
        toggleRoleEntry: toggleEntry,
        clearRoleMatrix: clearMatrix,
    } = useCertificationsMatrixStore()

    const originalMatrixSet = useMemo(
        () => new Set(data?.matrix.map((m) => m.sk) ?? []),
        [data?.matrix],
    )

    const handleEnterEditMode = useCallback(() => {
        initMatrix(originalMatrixSet)
        setFailedKeys(new Set())
        setEditMode(true)
    }, [initMatrix, originalMatrixSet])

    const hasChanges = useMemo(() => {
        if (!tempMatrix) return false
        if (tempMatrix.size !== originalMatrixSet.size) return true
        for (const key of tempMatrix) {
            if (!originalMatrixSet.has(key)) return true
        }
        return false
    }, [tempMatrix, originalMatrixSet])

    const changesCount = useMemo(() => {
        if (!tempMatrix) return 0
        let count = 0
        for (const key of tempMatrix) {
            if (!originalMatrixSet.has(key)) count++
        }
        for (const key of originalMatrixSet) {
            if (!tempMatrix.has(key)) count++
        }
        return count
    }, [tempMatrix, originalMatrixSet])

    const handleSave = useCallback(async () => {
        if (!tempMatrix) return

        const toAdd = [...tempMatrix].filter(
            (key) => !originalMatrixSet.has(key),
        )
        const toRemove = [...originalMatrixSet].filter(
            (key) => !tempMatrix.has(key),
        )

        setIsLoading(true)

        const results = await Promise.allSettled([
            ...toAdd.map((sk) => {
                const separatorIndex = sk.indexOf('#')
                return addRoleToMatrix({
                    certificate: sk.substring(0, separatorIndex),
                    role: sk.substring(separatorIndex + 1),
                    assignedAt: dayjs().format('DD/MM/YYYY'),
                    assignedBy: session?.user?.name || '',
                })
            }),
            ...toRemove.map((sk) => removeRoleFromMatrix('CERTS#ROLES', sk)),
        ])

        const newFailedKeys = new Set<string>()
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const failedKey =
                    index < toAdd.length
                        ? toAdd[index]
                        : toRemove[index - toAdd.length]
                newFailedKeys.add(failedKey)
            }
        })
        setFailedKeys(newFailedKeys)

        const hasErrors = newFailedKeys.size > 0

        await queryClient.invalidateQueries({
            queryKey: certificationKeys.role,
        })

        toast.push(
            <Notification
                title={t(
                    hasErrors
                        ? 'certifications.tables.role.messages.savePartial'
                        : 'certifications.tables.role.messages.saveSuccess',
                )}
                type={hasErrors ? 'warning' : 'success'}
            />,
        )

        setIsLoading(false)

        if (!hasErrors) {
            clearMatrix()
            setEditMode(false)
        }
    }, [tempMatrix, originalMatrixSet, clearMatrix, queryClient, t, session])

    const handleDiscardConfirm = useCallback(() => {
        setIsDiscardDialogOpen(false)
        clearMatrix()
        setFailedKeys(new Set())
        setEditMode(false)
    }, [clearMatrix])

    const isChecked = useCallback(
        (roleSk: string, certSk: string) => {
            const key = `${stripPrefix(certSk)}#${stripPrefix(roleSk)}`
            return editMode
                ? (tempMatrix?.has(key) ?? false)
                : originalMatrixSet.has(key)
        },
        [editMode, tempMatrix, originalMatrixSet],
    )

    const isFailed = useCallback(
        (roleSk: string, certSk: string) => {
            const key = `${stripPrefix(certSk)}#${stripPrefix(roleSk)}`
            return failedKeys.has(key)
        },
        [failedKeys],
    )

    const roles = useMemo(() => data?.roles ?? [], [data?.roles])
    const certificates = useMemo(
        () => data?.certificates ?? [],
        [data?.certificates],
    )

    const columns: ColumnDef<TCertificate>[] = useMemo(
        () => [
            {
                header: t('certifications.tables.role.name'),
                size: 240,
                cell: ({ row }) => (
                    <span className="font-semibold line-clamp-2 text-ellipsis overflow-hidden">
                        {row.original.name}
                    </span>
                ),
            },
            ...(roles.map((role) => ({
                header: (
                    <Tooltip title={role.name}>
                        <span className="text-ellipsis line-clamp-2">
                            {role.name}
                        </span>
                    </Tooltip>
                ),
                id: role.sk,
                size: 140,
                cell: ({ row }: { row: { original: TCertificate } }) => {
                    const failed = isFailed(role.sk, row.original.sk)
                    return (
                        <div
                            className={`flex justify-center rounded transition-colors py-2 ${
                                failed ? 'bg-red-100 dark:bg-red-900/30' : ''
                            }`}
                        >
                            <Checkbox
                                disabled={!editMode || isLoading}
                                checked={isChecked(role.sk, row.original.sk)}
                                className={
                                    failed
                                        ? '[&_input]:border-red-400 [&_input]:text-red-400'
                                        : ''
                                }
                                onChange={() =>
                                    toggleEntry(
                                        stripPrefix(row.original.sk),
                                        stripPrefix(role.sk),
                                    )
                                }
                            />
                        </div>
                    )
                },
            })) as unknown as ColumnDef<TCertificate>[]),
        ],
        [t, editMode, isLoading, roles, isChecked, isFailed, toggleEntry],
    )

    const pagedData = useMemo(() => {
        const start = (pageIndex - 1) * pageSize
        return certificates.slice(start, start + pageSize)
    }, [certificates, pageIndex, pageSize])

    return (
        <>
            <Dialog
                isOpen={isDiscardDialogOpen}
                onClose={() => setIsDiscardDialogOpen(false)}
                onRequestClose={() => setIsDiscardDialogOpen(false)}
            >
                <div className="flex flex-col gap-4 p-4">
                    <p>
                        {t('certifications.tables.discardModal.title', {
                            count: changesCount,
                        })}
                    </p>
                    <p>
                        {t(
                            'certifications.tables.discardModal.permanentDiscard',
                        )}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setIsDiscardDialogOpen(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button variant="solid" onClick={handleDiscardConfirm}>
                            {t('common.discard')}
                        </Button>
                    </div>
                </div>
            </Dialog>
            <AdaptiveCard
                className="mt-2"
                footer={{
                    className:
                        'bg-gray-50 dark:bg-gray-700 pb-2 pt-2 rounded-b-2xl flex justify-end gap-2',
                    content: (
                        <div className="flex gap-2 items-center">
                            {canEdit && (
                                <>
                                    {isLoading ? (
                                        <Spinner size={24} />
                                    ) : editMode ? (
                                        <>
                                            <Tooltip
                                                title={t('common.discard')}
                                            >
                                                <Button
                                                    variant="plain"
                                                    shape="circle"
                                                    size="xs"
                                                    icon={<TbX />}
                                                    onClick={() => {
                                                        hasChanges
                                                            ? setIsDiscardDialogOpen(
                                                                  true,
                                                              )
                                                            : handleDiscardConfirm()
                                                    }}
                                                />
                                            </Tooltip>
                                            <Tooltip title={t('common.save')}>
                                                <Button
                                                    variant="plain"
                                                    shape="circle"
                                                    size="xs"
                                                    icon={<FaRegSave />}
                                                    disabled={!hasChanges}
                                                    onClick={handleSave}
                                                />
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <Button
                                            variant="plain"
                                            shape="circle"
                                            size="xs"
                                            icon={<TbPencil />}
                                            onClick={handleEnterEditMode}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    ),
                }}
            >
                <DataTable
                    enableColumnVirtualization
                    columns={columns}
                    data={pagedData}
                    loading={isLoadingData}
                    pageSizes={[5, 10, 20]}
                    bodyMaxHeight={300}
                    bodyMinHeight={300}
                    pagingData={{
                        total: certificates.length,
                        pageIndex,
                        pageSize,
                    }}
                    onPaginationChange={(page) => setPageIndex(page)}
                    onSelectChange={(size) => {
                        setPageSize(size)
                        setPageIndex(1)
                    }}
                />
            </AdaptiveCard>
        </>
    )
}

export default RoleCertificationsTable
