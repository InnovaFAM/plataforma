'use client'

import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import { HiOutlineMinusCircle, HiOutlinePlusCircle } from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

type HHDetailMonthRow = {
    month: string
    workedHH: number
    absenceHH: number
    overtimeHH: number
}

type HHDetailServiceRow = {
    serviceId: string
    serviceName: string
    totalHH: number
    totalAbsenceHH: number
    subRows: HHDetailMonthRow[]
}

type ParentRow = {
    rowType: 'code'
    code: string
    label: string
    totalHH: number
    totalAbsenceHH: number
    subRows: ChildRow[]
}

type ChildRow = {
    rowType: 'month'
    month: string
    workedHH: number
    absenceHH: number
    overtimeHH: number
}

type TableRow = ParentRow | ChildRow

interface ReportsHHDetailTableProps {
    data: HHDetailServiceRow[]
}

const ReportsHHDetailTable = ({ data }: ReportsHHDetailTableProps) => {
    const [expanded, setExpanded] = useState<ExpandedState>({})

    const tableData = useMemo<ParentRow[]>(
        () =>
            data.map((item) => ({
                rowType: 'code',
                code: item.serviceId,
                label: item.serviceName,
                totalHH: item.totalHH,
                totalAbsenceHH: item.totalAbsenceHH,
                subRows: item.subRows.map((subRow) => ({
                    rowType: 'month',
                    month: subRow.month,
                    workedHH: subRow.workedHH,
                    absenceHH: subRow.absenceHH,
                    overtimeHH: subRow.overtimeHH,
                })),
            })),
        [data],
    )

    const columns = useMemo<ColumnDef<TableRow>[]>(
        () => [
            {
                id: 'expander',
                header: () => null,
                cell: ({ row }) => {
                    if (row.original.rowType !== 'code') {
                        return <span className="ml-6" />
                    }

                    return row.getCanExpand() ? (
                        <button
                            className="text-xl"
                            onClick={row.getToggleExpandedHandler()}
                        >
                            {row.getIsExpanded() ? (
                                <HiOutlineMinusCircle />
                            ) : (
                                <HiOutlinePlusCircle />
                            )}
                        </button>
                    ) : null
                },
            },
            {
                header: 'Servicio',
                id: 'code',
                cell: ({ row }) => {
                    if (row.original.rowType === 'code') {
                        return (
                            <div className="flex flex-col">
                                <span className="font-semibold">
                                    {row.original.code}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {row.original.label}
                                </span>
                            </div>
                        )
                    }

                    return (
                        <div
                            style={{ paddingLeft: `${row.depth * 1.5}rem` }}
                            className="text-sm"
                        >
                            {row.original.month}
                        </div>
                    )
                },
            },
            {
                header: 'HH trabajadas',
                id: 'workedHH',
                cell: ({ row }) => {
                    if (row.original.rowType === 'code') {
                        return row.original.totalHH.toLocaleString('es-CL')
                    }

                    return row.original.workedHH.toLocaleString('es-CL')
                },
            },
            {
                header: 'HH ausencias',
                id: 'absenceHH',
                cell: ({ row }) => {
                    if (row.original.rowType === 'code') {
                        return row.original.totalAbsenceHH.toLocaleString(
                            'es-CL',
                        )
                    }

                    return row.original.absenceHH.toLocaleString('es-CL')
                },
            },
            {
                header: 'HH extra',
                id: 'overtimeHH',
                cell: ({ row }) => {
                    if (row.original.rowType === 'code') {
                        return '-'
                    }

                    return row.original.overtimeHH.toLocaleString('es-CL')
                },
            },
        ],
        [],
    )

    const table = useReactTable({
        data: tableData,
        columns,
        state: { expanded },
        onExpandedChange: setExpanded,
        getSubRows: (row) => (row.rowType === 'code' ? row.subRows : undefined),
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return (
        <AdaptiveCard>
            <h4 className="text-xl font-semibold mb-4">
                Detalle HH por servicio
            </h4>

            <div className="overflow-x-auto">
                <Table bodyMaxHeight={420}>
                    <THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </THead>

                    <TBody>
                        {table.getRowModel().rows.map((row) => (
                            <Tr
                                key={row.id}
                                className={
                                    row.original.rowType === 'code'
                                        ? 'bg-gray-50/40 font-medium'
                                        : ''
                                }
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <Td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </TBody>
                </Table>
            </div>
        </AdaptiveCard>
    )
}

export default ReportsHHDetailTable
