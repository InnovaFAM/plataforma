'use client'

import dayjs from 'dayjs'
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
    InputGroup,
    Input,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { TbPencil, TbSearch, TbX } from 'react-icons/tb'
import { FaExpand, FaRegSave } from 'react-icons/fa'
import { TCertificate, TChoreCertificationsResponse } from '../types'
import { useCertificationsMatrixStore } from '../_store/certificationsStore'
import { addChoreToMatrix } from '@/server/actions/certifications/add-chore-to-matrix'
import { removeChoreFromMatrix } from '@/server/actions/certifications/remove-chore-from-matrix'
import { useQueryClient } from '@tanstack/react-query'
import { certificationKeys } from '@/server/actions/certifications/certification-keys'
import { useCan } from '@/hooks/useCan'
import classNames from 'classnames'

interface ChoreCertificationsTableProps {
    data?: TChoreCertificationsResponse
    isLoadingData?: boolean
}

const stripPrefix = (sk: string) => sk.substring(sk.indexOf('#') + 1)

const ChoreCertificationsTable = ({
    data,
    isLoadingData,
}: ChoreCertificationsTableProps) => {
    const t = useTranslation()
    const canEdit = useCan('certifications:edit')

    const queryClient = useQueryClient()
    const { session } = useCurrentSession()

    const [searchValue, setSearchValue] = useState('')
    const [inputVisible, setInputVisible] = useState(false)
    const [tableViewMode, setTableViewMode] = useState<'page' | 'modal'>('page')
    const [editMode, setEditMode] = useState(false)
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [isLoading, setIsLoading] = useState(false)
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
    const [failedKeys, setFailedKeys] = useState<Set<string>>(new Set())

    const {
        tempChoreMatrix: tempMatrix,
        initChoreMatrix: initMatrix,
        toggleChoreEntry: toggleEntry,
        clearChoreMatrix: clearMatrix,
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
                return addChoreToMatrix({
                    certificate: sk.substring(0, separatorIndex),
                    chore: sk.substring(separatorIndex + 1),
                    assignedAt: dayjs().format('DD/MM/YYYY'),
                    assignedBy: session?.user?.name || '',
                })
            }),
            ...toRemove.map((sk) => removeChoreFromMatrix('CERTS#CHORES', sk)),
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
            queryKey: certificationKeys.chore,
        })

        toast.push(
            <Notification
                title={t(
                    hasErrors
                        ? 'certifications.tables.chore.messages.savePartial'
                        : 'certifications.tables.chore.messages.saveSuccess',
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
        (choreSk: string, certSk: string) => {
            const key = `${stripPrefix(certSk)}#${stripPrefix(choreSk)}`
            return editMode
                ? (tempMatrix?.has(key) ?? false)
                : originalMatrixSet.has(key)
        },
        [editMode, tempMatrix, originalMatrixSet],
    )

    const isFailed = useCallback(
        (choreSk: string, certSk: string) => {
            const key = `${stripPrefix(certSk)}#${stripPrefix(choreSk)}`
            return failedKeys.has(key)
        },
        [failedKeys],
    )

    const filteredChores = useMemo(() => {
        if (!searchValue) return data?.chores || []
        return data?.chores.filter((role) =>
            role.name?.toLowerCase().includes(searchValue.toLowerCase()),
        )
    }, [data?.chores, searchValue])

    const certificates = useMemo(
        () => data?.certificates ?? [],
        [data?.certificates],
    )

    const columns: ColumnDef<TCertificate>[] = useMemo(
        () => [
            {
                header: t('certifications.tables.chore.name'),
                size: 240,
                cell: ({ row }) => (
                    <span className="font-semibold line-clamp-2 text-ellipsis overflow-hidden">
                        {row.original.name}
                    </span>
                ),
            },
            ...(filteredChores?.map((chore) => ({
                header: (
                    <Tooltip title={chore.name}>
                        <span className="text-ellipsis line-clamp-2">
                            {chore.name}
                        </span>
                    </Tooltip>
                ),
                id: chore.sk,
                size: 140,
                cell: ({ row }: { row: { original: TCertificate } }) => {
                    const failed = isFailed(chore.sk, row.original.sk)
                    return (
                        <div
                            className={`flex justify-center rounded transition-colors py-2 ${
                                failed ? 'bg-red-100 dark:bg-red-900/30' : ''
                            }`}
                        >
                            <Checkbox
                                disabled={!editMode || isLoading}
                                checked={isChecked(chore.sk, row.original.sk)}
                                className={
                                    failed
                                        ? '[&_input]:border-red-400 [&_input]:text-red-400'
                                        : ''
                                }
                                onChange={() =>
                                    toggleEntry(
                                        stripPrefix(row.original.sk),
                                        stripPrefix(chore.sk),
                                    )
                                }
                            />
                        </div>
                    )
                },
            })) as unknown as ColumnDef<TCertificate>[]),
        ],
        [
            t,
            editMode,
            isLoading,
            filteredChores,
            isChecked,
            isFailed,
            toggleEntry,
        ],
    )

    const pagedData = useMemo(() => {
        const start = (pageIndex - 1) * pageSize
        return certificates.slice(start, start + pageSize)
    }, [certificates, pageIndex, pageSize])

    const renderTable = useMemo(
        () => (
            <DataTable
                enableColumnVirtualization
                columns={columns}
                data={pagedData}
                loading={isLoadingData}
                pageSizes={[5, 10, 20]}
                bodyMaxHeight={tableViewMode === 'modal' ? undefined : 300}
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
        ),
        [
            pagedData,
            certificates.length,
            columns,
            isLoadingData,
            pageIndex,
            pageSize,
            tableViewMode,
        ],
    )

    const toolsRow = (
        <div className="flex justify-end gap-2">
            {isLoading ? (
                <Spinner size={24} />
            ) : editMode ? (
                <>
                    <Tooltip title={t('common.discard')}>
                        <Button
                            variant="plain"
                            shape="circle"
                            size="xs"
                            icon={<TbX />}
                            onClick={() => setIsDiscardDialogOpen(true)}
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
                <>
                    <InputGroup
                        className={classNames(
                            'mr-2',
                            !inputVisible ? 'outline-none border-none' : '',
                        )}
                    >
                        <Input
                            id="roles-search-input"
                            placeholder={t('common.search')}
                            size="xs"
                            className={classNames(
                                'text-xs transition-all duration-300',
                                inputVisible
                                    ? 'w-48 opacity-100'
                                    : 'w-0 opacity-0 pointer-events-none',
                            )}
                            tabIndex={inputVisible ? 0 : -1}
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value)
                            }}
                            suffix={
                                <Button
                                    className={classNames(
                                        !searchValue ? 'hidden' : '',
                                    )}
                                    size="xs"
                                    variant="plain"
                                    shape="circle"
                                    icon={<TbX className="text-xs" />}
                                    onClick={() => {
                                        setSearchValue('')
                                    }}
                                    tabIndex={-1}
                                />
                            }
                        />
                        <Button
                            className={classNames(
                                !inputVisible ? 'border-none bg-gray-50' : '',
                            )}
                            disabled={data?.chores.length === 0}
                            size="xs"
                            icon={
                                inputVisible ? (
                                    <TbX className="text-sm" />
                                ) : (
                                    <TbSearch className="text-sm" />
                                )
                            }
                            onClick={() => {
                                setSearchValue('')
                                setInputVisible((prev) => !prev)
                                if (!inputVisible) {
                                    setTimeout(() => {
                                        const input = document.querySelector(
                                            `#roles-search-input`,
                                        ) as HTMLInputElement
                                        input?.focus()
                                    }, 300)
                                }
                            }}
                        />
                    </InputGroup>
                    <Button
                        variant="plain"
                        shape="circle"
                        size="xs"
                        icon={<TbPencil />}
                        onClick={handleEnterEditMode}
                    />
                    <Button
                        className={classNames(
                            tableViewMode === 'modal' ? 'hidden' : '',
                        )}
                        variant="plain"
                        shape="circle"
                        size="xs"
                        icon={<FaExpand />}
                        onClick={() => {
                            setPageSize(20)
                            setTableViewMode((prev) =>
                                prev === 'page' ? 'modal' : 'page',
                            )
                        }}
                    />
                </>
            )}
        </div>
    )

    return (
        <>
            <AdaptiveCard
                className="mt-2"
                footer={{
                    className:
                        'bg-gray-50 dark:bg-gray-700 pb-2 pt-2 rounded-b-2xl flex justify-end gap-2',
                    content: (
                        <div className="flex gap-2 items-center">
                            {canEdit && toolsRow}
                        </div>
                    ),
                }}
            >
                {renderTable}
            </AdaptiveCard>
            <Dialog
                className="min-w-[90vw]"
                contentClassName="h-[80vh] flex flex-col"
                isOpen={tableViewMode === 'modal'}
                onClose={() => {
                    setPageSize(10)
                    setTableViewMode('page')
                }}
                onRequestClose={() => {
                    setPageSize(10)
                    setTableViewMode('page')
                }}
            >
                <div className="flex flex-col h-full">
                    <h4 className="heading-text text-xl font-bold mb-2">
                        Matriz de Faena / Certificaciones
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 mt-8 py-2 rounded-t-2xl flex justify-end gap-2 px-4 shrink-0">
                        {toolsRow}
                    </div>
                    <div className="flex-1 overflow-auto">{renderTable}</div>
                </div>
            </Dialog>
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
        </>
    )
}

export default ChoreCertificationsTable
