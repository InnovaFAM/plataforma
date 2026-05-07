'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import { Button, Input, Dialog, InputGroup } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TbPencil, TbPlus, TbSearch, TbX } from 'react-icons/tb'
import { FaExpand } from 'react-icons/fa6'
import { ColumnDefTemplate, HeaderContext } from '@tanstack/react-table'

import { TBackOfficeDivision } from '../../types'
import BackOfficeCreateDivisionModal from '../creation-modals/BackOfficeCreateDivisionModal'
import BackOfficeActionColumn from './ActionColumn'
import { useBackOfficeStore } from '../../_store/backOfficeStore'
import { useClickCoolDown } from '@/utils/hooks/useClickCooldown'
import TableEmptyState from '@/components/shared/TableEmptyState'
import classNames from '@/utils/classNames'
import { useCan } from '@/hooks/useCan'

const BackOfficeDivisionTable = ({
    id,
    data,
    lastEvaluatedKey,
    isLoading,
    onFetch,
}: {
    id: string
    data: TBackOfficeDivision[]
    lastEvaluatedKey?: string
    isLoading?: boolean
    onFetch?: (token?: string) => void
}) => {
    const t = useTranslation()
    const canCreate = useCan('backOffice:create')
    const canEdit = useCan('backOffice:edit')
    const { blocked: navBlocked, trigger: triggerNav } = useClickCoolDown(250)

    const [modalOpen, setModalOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [inputVisible, setInputVisible] = useState(false)
    const [tableViewMode, setTableViewMode] = useState<'page' | 'modal'>('page')
    const [pageSize, setPageSize] = useState(10)

    const [tokenStack, setTokenStack] = useState<(string | undefined)[]>([
        undefined,
    ])
    const [batchIndex, setBatchIndex] = useState(0)
    const [localPage, setLocalPage] = useState(0)
    const batchPagesMapRef = useRef<Record<number, number>>({})

    const setTempDivision = useBackOfficeStore((state) => state.setTempDivision)

    const filteredData = useMemo(() => {
        if (!searchValue) return data
        return data.filter(
            (division) =>
                division.name
                    ?.toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                division.number
                    ?.toLowerCase()
                    .includes(searchValue.toLowerCase()),
        )
    }, [data, searchValue])

    const isFirstRender = useRef(true)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        setTokenStack([undefined])
        setBatchIndex(0)
        setLocalPage(0)
        batchPagesMapRef.current = {}
        onFetch?.(undefined)
    }, [searchValue, pageSize, onFetch])

    const pagesInBatch = Math.max(1, Math.ceil(filteredData.length / pageSize))

    const pagedData = useMemo(() => {
        const start = localPage * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [filteredData, localPage, pageSize])

    const hasNextToken = !!lastEvaluatedKey
    const isLastLocalPage = localPage >= pagesInBatch - 1
    const isFirstPage = batchIndex === 0 && localPage === 0
    const hasNextPage = !isLastLocalPage || hasNextToken
    const isEmpty = filteredData.length === 0 && !isLoading && !hasNextToken

    const pagesBeforeCurrent = Array.from(
        { length: batchIndex },
        (_, i) => batchPagesMapRef.current[i] ?? pagesInBatch,
    ).reduce((sum, pages) => sum + pages, 0)

    const currentPageNumber = pagesBeforeCurrent + localPage + 1

    useEffect(() => {
        if (data) {
            batchPagesMapRef.current[batchIndex] = Math.max(
                1,
                Math.ceil(filteredData.length / pageSize),
            )
        }
    }, [data, batchIndex, filteredData.length, pageSize])

    const goNext = useCallback(() => {
        if (!isLastLocalPage) {
            setLocalPage((p) => p + 1)
        } else if (hasNextToken) {
            const newToken = lastEvaluatedKey
            const nextBatch = batchIndex + 1
            if (nextBatch < tokenStack.length) {
                setBatchIndex(nextBatch)
            } else {
                setTokenStack((s) => [...s, newToken])
                setBatchIndex(nextBatch)
            }
            setLocalPage(0)
            onFetch?.(newToken)
        }
    }, [
        isLastLocalPage,
        hasNextToken,
        lastEvaluatedKey,
        batchIndex,
        tokenStack.length,
        onFetch,
    ])

    const goPrev = useCallback(() => {
        if (localPage > 0) {
            setLocalPage((p) => p - 1)
        } else if (batchIndex > 0) {
            const prevBatch = batchIndex - 1
            const prevBatchPages = batchPagesMapRef.current[prevBatch] ?? 1
            setBatchIndex(prevBatch)
            setLocalPage(prevBatchPages - 1)
            onFetch?.(tokenStack[prevBatch])
        }
    }, [localPage, batchIndex, tokenStack, onFetch])

    const columns: ColumnDef<TBackOfficeDivision>[] = useMemo(
        () => [
            {
                header: t('backOffice.divisionTable.name'),
                accessorKey: 'name',
                cell: ({ row }) => (
                    <p className="line-clamp-2 text-ellipsis overflow-hidden font-semibold">
                        {row.original.name || '--'}
                    </p>
                ),
            },
            {
                header: t('backOffice.divisionTable.number'),
                accessorKey: 'number',
                cell: ({ row }) => (
                    <p className="line-clamp-2 text-ellipsis overflow-hidden">
                        {row.original.number || '--'}
                    </p>
                ),
            },
            {
                header: (
                    <div
                        className={classNames(
                            'flex justify-start transition-all duration-300',
                            editMode
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-4 pointer-events-none',
                        )}
                    >
                        {t('backOffice.tables.actions.title')}
                    </div>
                ) as unknown as
                    | ColumnDefTemplate<
                          HeaderContext<TBackOfficeDivision, unknown>
                      >
                    | undefined,
                id: 'actions',
                size: 60,
                cell: ({ row }) => (
                    <div
                        className={classNames(
                            'flex justify-start transition-all duration-300',
                            editMode
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 translate-x-4 pointer-events-none',
                        )}
                    >
                        <BackOfficeActionColumn
                            onEdit={() => {
                                setTempDivision(row.original)
                                setModalOpen(true)
                            }}
                            onDelete={() => {}}
                        />
                    </div>
                ),
            },
        ],
        [t, editMode, setTempDivision],
    )

    const renderTable = useMemo(
        () => (
            <DataTable<TBackOfficeDivision>
                arrowPagination
                bodyMaxHeight={tableViewMode === 'modal' ? undefined : 300}
                bodyMinHeight={tableViewMode === 'modal' ? undefined : 300}
                columns={columns}
                data={pagedData}
                noData={isEmpty}
                customNoDataIcon={<TableEmptyState />}
                hidePagingOption
                loading={isLoading}
                pagingData={{
                    total: pagedData.length,
                    pageIndex: 1,
                    pageSize,
                }}
                pageSizes={[5, 10, 20]}
                currentPageNumber={currentPageNumber}
                onPrevPage={() => triggerNav(goPrev)}
                onNextPage={() => triggerNav(goNext)}
                disablePrevPage={isFirstPage || isEmpty || navBlocked}
                disableNextPage={!hasNextPage || isEmpty || navBlocked}
                onSelectChange={(size) => {
                    setPageSize(size)
                }}
            />
        ),
        [
            columns,
            pagedData,
            isEmpty,
            isLoading,
            pageSize,
            currentPageNumber,
            triggerNav,
            isFirstPage,
            navBlocked,
            hasNextPage,
            goPrev,
            goNext,
            tableViewMode,
        ],
    )

    const toolsRow = (
        <div className="flex gap-2">
            <InputGroup
                className={classNames(
                    'mr-2',
                    !inputVisible ? 'outline-none border-none' : '',
                )}
            >
                <Input
                    id={`${id}-search-input`}
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
                            className={classNames(!searchValue ? 'hidden' : '')}
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
                                    `#${id}-search-input`,
                                ) as HTMLInputElement
                                input?.focus()
                            }, 300)
                        }
                    }}
                />
            </InputGroup>
            {canEdit && (
                <Button
                    variant="plain"
                    shape="circle"
                    size="xs"
                    icon={editMode ? <TbX /> : <TbPencil />}
                    onClick={() => setEditMode((prev) => !prev)}
                />
            )}
            {canCreate && (
                <Button
                    variant="plain"
                    shape="circle"
                    size="xs"
                    icon={<TbPlus />}
                    onClick={() => setModalOpen(true)}
                />
            )}
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
        </div>
    )

    return (
        <div id={id}>
            <h4 className="heading-text text-xl font-bold mb-2">
                {t('backOffice.divisionTable.title')}
            </h4>
            <p className="text-gray-500 mb-4">
                {t('backOffice.divisionTable.description')}
            </p>
            <AdaptiveCard
                footer={{
                    className:
                        'bg-gray-50 dark:bg-gray-700 pb-2 pt-2 rounded-b-2xl flex justify-end',
                    content: toolsRow,
                }}
            >
                {renderTable}
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
                            {t('backOffice.divisionTable.title')}
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 mt-8 py-2 rounded-t-2xl flex justify-end gap-2 px-4 shrink-0">
                            {toolsRow}
                        </div>
                        <div className="flex-1 overflow-auto">
                            {renderTable}
                        </div>
                    </div>
                </Dialog>
            </AdaptiveCard>
            <BackOfficeCreateDivisionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </div>
    )
}

export default BackOfficeDivisionTable
