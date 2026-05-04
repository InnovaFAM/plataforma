import {
    useMemo,
    useRef,
    useEffect,
    useState,
    useImperativeHandle,
} from 'react'
import classNames from 'classnames'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import TableRowSkeleton from './loaders/TableRowSkeleton'
import Loading from './Loading'
import FileNotFound from '@/assets/svg/FileNotFound'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    ColumnSort,
    Row,
    CellContext,
} from '@tanstack/react-table'
import type { TableProps } from '@/components/ui/Table'
import type { SkeletonProps } from '@/components/ui/Skeleton'
import type { Ref, ChangeEvent, ReactNode } from 'react'
import type { CheckboxProps } from '@/components/ui/Checkbox'
import useTranslation from '@/utils/hooks/useTranslation'
import { Button } from '../ui'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

export type OnSortParam = { order: 'asc' | 'desc' | ''; key: string | number }

type DataTableProps<T> = {
    columns: ColumnDef<T>[]
    customNoDataIcon?: ReactNode
    data?: unknown[]
    loading?: boolean
    noData?: boolean
    instanceId?: string
    onCheckBoxChange?: (checked: boolean, row: T) => void
    onIndeterminateCheckBoxChange?: (checked: boolean, rows: Row<T>[]) => void
    onPaginationChange?: (page: number) => void
    onSelectChange?: (num: number) => void
    onSort?: (sort: OnSortParam) => void
    onDeselectAll?: () => void
    pageSizes?: number[]
    selectable?: boolean
    skeletonAvatarColumns?: number[]
    skeletonAvatarProps?: SkeletonProps
    pagingData?: {
        total: number
        pageIndex: number
        pageSize: number
    }
    hidePagingOption?: boolean
    checkboxChecked?: (row: T) => boolean
    indeterminateCheckboxChecked?: (row: Row<T>[]) => boolean
    ref?: Ref<DataTableResetHandle | HTMLTableElement>
    fixedPagination?: boolean
    arrowPagination?: boolean
    currentPageNumber?: number
    onPrevPage?: () => void
    onNextPage?: () => void
    disablePrevPage?: boolean
    disableNextPage?: boolean
    hidePagination?: boolean
    enableColumnVirtualization?: boolean
} & TableProps

type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
    onChange: (event: CheckBoxChangeEvent) => void
    indeterminate: boolean
    onCheckBoxChange?: (event: CheckBoxChangeEvent) => void
    onIndeterminateCheckBoxChange?: (event: CheckBoxChangeEvent) => void
}

const { Tr, Th, Td, THead, TBody, Sorter } = Table

const IndeterminateCheckbox = (props: IndeterminateCheckboxProps) => {
    const {
        indeterminate,
        onChange,
        onCheckBoxChange,
        onIndeterminateCheckBoxChange,
        ...rest
    } = props

    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (typeof indeterminate === 'boolean' && ref.current) {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, indeterminate])

    const handleChange = (e: CheckBoxChangeEvent) => {
        onChange(e)
        onCheckBoxChange?.(e)
        onIndeterminateCheckBoxChange?.(e)
    }

    return (
        <Checkbox
            ref={ref}
            className="mb-0"
            onChange={(_, e) => handleChange(e)}
            {...rest}
        />
    )
}

export type DataTableResetHandle = {
    resetSorting: () => void
    resetSelected: () => void
}

function DataTable<T>(props: DataTableProps<T>) {
    const {
        skeletonAvatarColumns,
        columns: columnsProp = [],
        data = [],
        customNoDataIcon,
        loading,
        noData,
        onCheckBoxChange,
        onIndeterminateCheckBoxChange,
        onPaginationChange,
        onSelectChange,
        onSort,
        onDeselectAll,
        pageSizes = [5, 10, 25, 50, 100],
        selectable = false,
        skeletonAvatarProps,
        pagingData = {
            total: 0,
            pageIndex: 1,
            pageSize: 10,
        },
        hidePagingOption = false,
        checkboxChecked,
        indeterminateCheckboxChecked,
        instanceId = 'data-table',
        ref,
        fixedPagination = false,
        arrowPagination = false,
        onPrevPage,
        onNextPage,
        disablePrevPage,
        disableNextPage,
        currentPageNumber,
        hidePagination = false,
        enableColumnVirtualization = false,
        ...rest
    } = props

    const t = useTranslation()
    const { pageSize, pageIndex, total } = pagingData

    const [sorting, setSorting] = useState<ColumnSort[] | null>(null)

    const tableContainerRef = useRef<HTMLDivElement>(null)

    const pageSizeOption = useMemo(
        () =>
            pageSizes.map((number) => ({
                value: number,
                label: `${number} / ${t('dataTable.pageSize')}`,
            })),
        [pageSizes, t],
    )

    useEffect(() => {
        if (Array.isArray(sorting)) {
            const sortOrder =
                sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : ''
            const id = sorting.length > 0 ? sorting[0].id : ''
            onSort?.({ order: sortOrder, key: id })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting])

    const handleIndeterminateCheckBoxChange = (
        checked: boolean,
        rows: Row<T>[],
    ) => {
        if (!loading) {
            onIndeterminateCheckBoxChange?.(checked, rows)
        }
    }

    const handleCheckBoxChange = (checked: boolean, row: T) => {
        if (!loading) {
            onCheckBoxChange?.(checked, row)
        }
    }

    const finalColumns: ColumnDef<T>[] = useMemo(() => {
        const columns = columnsProp

        if (selectable) {
            return [
                {
                    id: 'select',
                    maxSize: 50,
                    header: ({ table }) => (
                        <IndeterminateCheckbox
                            checked={
                                indeterminateCheckboxChecked
                                    ? indeterminateCheckboxChecked(
                                          table.getRowModel().rows,
                                      )
                                    : table.getIsAllRowsSelected()
                            }
                            indeterminate={table.getIsSomeRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                            onIndeterminateCheckBoxChange={(e) => {
                                handleIndeterminateCheckBoxChange(
                                    e.target.checked,
                                    table.getRowModel().rows,
                                )
                            }}
                        />
                    ),
                    cell: ({ row }) => (
                        <IndeterminateCheckbox
                            checked={
                                checkboxChecked
                                    ? checkboxChecked(row.original)
                                    : row.getIsSelected()
                            }
                            disabled={!row.getCanSelect()}
                            indeterminate={row.getIsSomeSelected()}
                            onChange={row.getToggleSelectedHandler()}
                            onCheckBoxChange={(e) =>
                                handleCheckBoxChange(
                                    e.target.checked,
                                    row.original,
                                )
                            }
                        />
                    ),
                },
                ...columns,
            ]
        }
        return columns
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnsProp, selectable, loading, checkboxChecked])

    const table = useReactTable({
        data,
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        columns: finalColumns as ColumnDef<unknown | object | any[], any>[],
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        onSortingChange: (sorter) => {
            setSorting(sorter as ColumnSort[])
        },
        state: {
            sorting: sorting as ColumnSort[],
        },
    })

    const visibleColumns = table.getVisibleLeafColumns()

    const columnVirtualizer = useVirtualizer({
        count: enableColumnVirtualization ? visibleColumns.length : 0,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: (index) => visibleColumns[index]?.getSize() ?? 150,
        horizontal: true,
        overscan: 3,
    })

    const virtualColumns = enableColumnVirtualization
        ? columnVirtualizer.getVirtualItems()
        : null

    const virtualPaddingLeft =
        virtualColumns && virtualColumns.length > 0
            ? (virtualColumns[0]?.start ?? 0)
            : 0

    const virtualPaddingRight =
        virtualColumns && virtualColumns.length > 0
            ? columnVirtualizer.getTotalSize() -
              (virtualColumns[virtualColumns.length - 1]?.end ?? 0)
            : 0

    const resetSorting = () => {
        table.resetSorting()
    }

    const resetSelected = () => {
        table.resetRowSelection(true)
    }

    useImperativeHandle(ref, () => ({
        resetSorting,
        resetSelected,
    }))

    const handlePaginationChange = (page: number) => {
        if (!loading) {
            resetSelected()
            onPaginationChange?.(page)
        }
    }

    const handleSelectChange = (value?: number) => {
        if (!loading) {
            onSelectChange?.(Number(value))
        }
    }

    return (
        <Loading
            loading={Boolean(loading && data.length !== 0)}
            type="cover"
            className={classNames(fixedPagination ? 'relative' : '')}
        >
            <Table {...rest} scrollContainerRef={tableContainerRef}>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {virtualColumns ? (
                                <>
                                    {virtualPaddingLeft > 0 && (
                                        <Th
                                            style={{
                                                width: virtualPaddingLeft,
                                                padding: 0,
                                            }}
                                        />
                                    )}
                                    {virtualColumns.map((vc) => {
                                        const header =
                                            headerGroup.headers[vc.index]
                                        return (
                                            <Th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                    width: vc.size,
                                                    minWidth: vc.size,
                                                }}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={classNames(
                                                            header.column.getCanSort() &&
                                                                'cursor-pointer select-none',
                                                            loading &&
                                                                'pointer-events-none',
                                                        )}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext(),
                                                        )}
                                                        {header.column.getCanSort() && (
                                                            <Sorter
                                                                sort={header.column.getIsSorted()}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </Th>
                                        )
                                    })}
                                    {virtualPaddingRight > 0 && (
                                        <Th
                                            style={{
                                                width: virtualPaddingRight,
                                                padding: 0,
                                            }}
                                        />
                                    )}
                                </>
                            ) : (
                                headerGroup.headers.map((header) => (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={classNames(
                                                    header.column.getCanSort() &&
                                                        'cursor-pointer select-none point',
                                                    loading &&
                                                        'pointer-events-none',
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getCanSort() && (
                                                    <Sorter
                                                        sort={header.column.getIsSorted()}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </Th>
                                ))
                            )}
                        </Tr>
                    ))}
                </THead>
                {loading && data.length === 0 ? (
                    <TableRowSkeleton
                        columns={(finalColumns as Array<T>).length}
                        rows={pagingData.pageSize}
                        avatarInColumns={skeletonAvatarColumns}
                        avatarProps={skeletonAvatarProps}
                    />
                ) : (
                    <TBody>
                        {noData ? (
                            <Tr>
                                <Td
                                    className="hover:bg-transparent"
                                    colSpan={finalColumns.length}
                                >
                                    <div className="flex flex-col items-center gap-4">
                                        {customNoDataIcon ? (
                                            customNoDataIcon
                                        ) : (
                                            <>
                                                <FileNotFound />
                                                <span className="font-semibold">
                                                    No data found!
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        ) : (
                            table
                                .getRowModel()
                                .rows.slice(0, pageSize)
                                .map((row) => (
                                    <Tr key={row.id}>
                                        {virtualColumns ? (
                                            <>
                                                {virtualPaddingLeft > 0 && (
                                                    <Td
                                                        style={{
                                                            width: virtualPaddingLeft,
                                                            padding: 0,
                                                        }}
                                                    />
                                                )}
                                                {virtualColumns.map((vc) => {
                                                    const cell =
                                                        row.getVisibleCells()[
                                                            vc.index
                                                        ]
                                                    return (
                                                        <Td
                                                            key={cell.id}
                                                            style={{
                                                                width: vc.size,
                                                                minWidth:
                                                                    vc.size,
                                                            }}
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext(),
                                                            )}
                                                        </Td>
                                                    )
                                                })}
                                                {virtualPaddingRight > 0 && (
                                                    <Td
                                                        style={{
                                                            width: virtualPaddingRight,
                                                            padding: 0,
                                                        }}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <Td
                                                        key={cell.id}
                                                        style={{
                                                            width: cell.column.getSize(),
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </Td>
                                                ))
                                        )}
                                    </Tr>
                                ))
                        )}
                    </TBody>
                )}
            </Table>
            <div
                className={classNames(
                    'flex items-center justify-between mt-4',
                    fixedPagination ? 'sticky bottom-0 bg-white pt-2' : '',
                )}
            >
                <div className="flex gap-2 items-center">
                    {arrowPagination ? (
                        <div className="flex items-center gap-1">
                            <Button
                                onClick={onPrevPage}
                                disabled={disablePrevPage}
                                className="p-1.5 rounded"
                                variant="plain"
                            >
                                <HiChevronLeft className="text-lg" />
                            </Button>
                            <span className="px-3 py-1 text-sm font-bold text-primary">
                                {currentPageNumber ?? pageIndex}
                            </span>
                            <Button
                                onClick={onNextPage}
                                disabled={disableNextPage}
                                className="p-1.5 rounded"
                                variant="plain"
                            >
                                <HiChevronRight className="text-lg" />
                            </Button>
                        </div>
                    ) : !hidePagination ? (
                        <Pagination
                            pageSize={pageSize}
                            currentPage={pageIndex}
                            total={total}
                            onChange={handlePaginationChange}
                        />
                    ) : null}
                </div>
                <div className="flex gap-2" style={{ minWidth: 130 }}>
                    {selectable && (
                        <Button
                            variant="solid"
                            size="sm"
                            onClick={() => {
                                resetSelected()
                                onDeselectAll?.()
                            }}
                            disabled={
                                loading ||
                                table.getSelectedRowModel().rows.length === 0
                            }
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            {t('common.removeSelection')}
                        </Button>
                    )}
                    <Select
                        className={classNames(hidePagingOption && 'hidden')}
                        instanceId={instanceId}
                        size="sm"
                        menuPlacement="top"
                        isSearchable={false}
                        value={pageSizeOption.filter(
                            (option) => option.value === pageSize,
                        )}
                        options={pageSizeOption}
                        onChange={(option) => handleSelectChange(option?.value)}
                    />
                </div>
            </div>
        </Loading>
    )
}

export type { ColumnDef, Row, CellContext }
export default DataTable
