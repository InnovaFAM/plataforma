'use client'
import { useEffect, useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import { HiOutlinePlusCircle, HiOutlineMinusCircle } from 'react-icons/hi'
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import useTranslation from '@/utils/hooks/useTranslation'
import {
    TContractManager,
    TDetailedService,
    TSubContractManager,
} from '../types'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import classNames from '@/utils/classNames'
import getSubContractStatusText from '../_utils/getSubContractStatusText'
import { Button, Skeleton } from '@/components/ui'
import { TbMinus, TbPencil, TbTrash } from 'react-icons/tb'
import ModalAddSubContract from './edition-creation/ModalAddSubContract'

interface SubContractTableProps {
    data: TSubContractManager[]
    onValueChange?: (
        prop: keyof TDetailedService,
        value: TDetailedService[keyof TDetailedService],
    ) => void
    isLoading?: boolean
}
const { Tr, Th, Td, THead, TBody } = Table

const SubContractTable = ({
    data,
    onValueChange,
    isLoading = false,
}: SubContractTableProps) => {
    const t = useTranslation()
    const [openModal, setOpenModal] = useState(false)
    const [editingSubContract, setEditingSubContract] =
        useState<TSubContractManager | null>(null)

    const handleAddSubContract = () => {
        setEditingSubContract(null)
        setOpenModal(true)
    }

    const handleClose = (
        updatedSubContracts: TSubContractManager[] | undefined = undefined,
    ) => {
        console.log('updatedSubContracts', updatedSubContracts)
        setEditingSubContract(null)
        setOpenModal(false)

        if (updatedSubContracts) {
            onValueChange?.('submanagers', updatedSubContracts)
        }
    }

    const ActionColumn = ({
        onEdit,
        onRemove,
    }: {
        onEdit: () => void
        onRemove: () => void
    }) => {
        return (
            <div className="flex items-center justify-start gap-4">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={() => {
                        onRemove()
                    }}
                >
                    <TbTrash />
                </div>
            </div>
        )
    }

    const columns = useMemo<
        ColumnDef<TSubContractManager | TContractManager>[]
    >(
        () => [
            {
                id: 'expander',
                header: ({ table }) => {
                    return (
                        <button
                            className="text-xl"
                            {...{
                                onClick:
                                    table.getToggleAllRowsExpandedHandler(),
                            }}
                        >
                            {table.getIsAllRowsExpanded() ? (
                                <HiOutlineMinusCircle />
                            ) : (
                                <HiOutlinePlusCircle />
                            )}
                        </button>
                    )
                },
                cell: ({ row, getValue }) => {
                    return (
                        <>
                            {row.getCanExpand() ? (
                                <button
                                    className="text-xl"
                                    {...{
                                        onClick: row.getToggleExpandedHandler(),
                                    }}
                                >
                                    {row.getIsExpanded() ? (
                                        <HiOutlineMinusCircle />
                                    ) : (
                                        <HiOutlinePlusCircle />
                                    )}
                                </button>
                            ) : null}
                            {getValue()}
                        </>
                    )
                },
            },
            {
                header: t('services.details.table.name'),
                accessorKey: 'name',
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span className="whitespace-nowrap">
                                {'companyName' in row.original
                                    ? row.original.companyName
                                    : row.original.name}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.adc'),
                accessorKey: 'contractManager',
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span
                                className={classNames(
                                    'whitespace-nowrap',
                                    'contractManagers' in row.original &&
                                        'font-bold text-black',
                                )}
                            >
                                {'contractManagers' in row.original ? (
                                    <>
                                        {row.original.contractManagers.length >
                                        0
                                            ? row.original.contractManagers[0]
                                                  .name
                                            : ''}
                                        {row.original.contractManagers.length >
                                            1 && (
                                            <span className="ml-2 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                                                +
                                                {(row.original.contractManagers
                                                    .length || 0) - 1}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    row.original.email
                                )}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.startDate'),
                accessorKey: 'startDate',
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span
                                className={classNames(
                                    'whitespace-nowrap',
                                    'startDate' in row.original &&
                                        'endDate' in row.original &&
                                        'font-semibold',
                                )}
                            >
                                {'startDate' in row.original &&
                                'endDate' in row.original
                                    ? `${
                                          row.original.startDate
                                              ? getDayJsDate(
                                                    row.original.startDate,
                                                    'YYYY-MM-DD',
                                                )
                                              : '-'
                                      }
                                ➔
                                ${
                                    row.original.endDate
                                        ? getDayJsDate(
                                              row.original.endDate,
                                              'YYYY-MM-DD',
                                          )
                                        : '-'
                                }`
                                    : row.original.phoneNumber || '–'}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.status'),
                accessorKey: 'status',
                cell: ({ getValue }) => {
                    const status = getValue() as TSubContractManager['status']

                    return (
                        <span className="whitespace-nowrap">
                            {getSubContractStatusText(status, t)}
                        </span>
                    )
                },
            },
        ],
        [t],
    )

    const [expanded, setExpanded] = useState<ExpandedState>({})

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        getSubRows: (row) => {
            if ('contractManagers' in row) {
                return row.contractManagers || []
            }
            return []
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold mb-4 mt-1">
                    {t('services.details.subContractsAdmins')}
                </h4>
                {onValueChange && (
                    <Button onClick={handleAddSubContract} size="sm">
                        {t('common.add')}
                    </Button>
                )}
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
                    {!data.length && (
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
                                {onValueChange &&
                                'companyName' in row.original ? (
                                    <Td>
                                        <ActionColumn
                                            onEdit={() => {
                                                if (
                                                    'companyName' in
                                                    row.original
                                                ) {
                                                    setEditingSubContract(
                                                        row.original,
                                                    )
                                                    setOpenModal(true)
                                                }
                                            }}
                                            onRemove={() => {
                                                if (
                                                    'companyName' in
                                                    row.original
                                                ) {
                                                    const updatedSubContracts =
                                                        data.filter(
                                                            (subContract) =>
                                                                subContract !==
                                                                row.original,
                                                        )
                                                    onValueChange(
                                                        'submanagers',
                                                        updatedSubContracts,
                                                    )
                                                }
                                            }}
                                        />
                                    </Td>
                                ) : null}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
            <ModalAddSubContract
                open={openModal}
                onClose={handleClose}
                editingSubContract={editingSubContract}
                data={data}
            />
        </>
    )
}

export default SubContractTable
