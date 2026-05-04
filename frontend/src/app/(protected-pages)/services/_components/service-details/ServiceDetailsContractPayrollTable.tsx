'use client'
import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import useTranslation from '@/utils/hooks/useTranslation'
import { TServiceRole } from '../../types'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import { Input, Skeleton } from '@/components/ui'

interface ServiceDetailsContractPayrollTableProps {
    data: TServiceRole[]
    onRoleClick?: (roleName: string) => void
    isLoading?: boolean
}
const { Tr, Th, Td, THead, TBody } = Table

const ServiceDetailsContractPayrollTable = ({
    data,
    onRoleClick,
    isLoading = false,
}: ServiceDetailsContractPayrollTableProps) => {
    const t = useTranslation()
    const [filter, setFilter] = useState('')
    const filteredData = useMemo(() => {
        if (!filter) return data
        return data.filter((role) =>
            role.roleName.toLowerCase().includes(filter.toLowerCase()),
        )
    }, [data, filter])

    const columns = useMemo<ColumnDef<TServiceRole>[]>(
        () => [
            {
                header: t('services.details.table.name'),
                accessorKey: 'roleName',
                cell: ({ getValue, row }) => {
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span
                                className="whitespace-nowrap text-blue-600 cursor-pointer font-medium"
                                onClick={() =>
                                    onRoleClick?.(row.original.roleName)
                                }
                            >
                                {getValue() as string}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.assignationDate'),
                accessorKey: 'startDate',
                cell: ({ row }) => {
                    const startDate = row.original.startedAt
                    const endDate = row.original.endedAt
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span className="whitespace-nowrap font-semibold">
                                {startDate
                                    ? getDayJsDate(startDate, 'YYYY-MM-DD')
                                    : '-'}
                                {' ➔ '}
                                {endDate
                                    ? getDayJsDate(endDate, 'YYYY-MM-DD')
                                    : '-'}
                            </span>
                        </div>
                    )
                },
            },

            {
                header: t('services.details.table.requiredPeople'),
                accessorKey: 'required',
                cell: ({ getValue }) => {
                    return (
                        <span className="whitespace-nowrap font-semibold">
                            {(getValue() as number) || 0}
                        </span>
                    )
                },
            },
            {
                header: t('services.details.table.proposedPeople'),
                accessorKey: 'proposed',
                cell: ({ getValue }) => {
                    return (
                        <span className="whitespace-nowrap font-semibold">
                            {(getValue() as number) || 0}
                        </span>
                    )
                },
            },
            {
                header: t('services.details.table.confirmedPeople'),
                accessorKey: 'confirmed',
                cell: ({ getValue }) => {
                    return (
                        <span className="whitespace-nowrap font-semibold">
                            {(getValue() as number) || 0}
                        </span>
                    )
                },
            },
        ],
        [t, onRoleClick],
    )

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <div className="flex justify-end">
                <Input
                    placeholder={t(
                        'services.details.table.roleSearchPlaceholder',
                    )}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="mb-4 max-w-sm"
                />
            </div>
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {!filteredData.length && (
                        <Tr>
                            <Td
                                colSpan={columns.length}
                                className="text-center"
                            >
                                {isLoading ? (
                                    <div>
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                    </div>
                                ) : (
                                    t('services.details.table.noData')
                                )}
                            </Td>
                        </Tr>
                    )}
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
        </>
    )
}

export default ServiceDetailsContractPayrollTable
