import { useMemo, Fragment, useState } from 'react'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { TCollabEvaluation } from '../../types'
import { averageScore } from './CollaboratorDetailsPerformanceEvaluations'
import EvaluationForm from './CollaboratorsDetailsPerformanceEvaluationsForm'
import useTranslation from '@/utils/hooks/useTranslation'
import { Button, Dialog } from '@/components/ui'
import { TbEye, TbTrash } from 'react-icons/tb'
import dayjs from 'dayjs'

const { Tr, Th, Td, THead, TBody } = Table

interface PerformanceEvaluationsTableProps {
    evaluations: TCollabEvaluation[]
    onDelete: (sk: string) => void
    isDeleting?: boolean
}

const PerformanceEvaluationsTable = ({
    evaluations,
    onDelete,
    isDeleting = false,
}: PerformanceEvaluationsTableProps) => {
    const t = useTranslation()
    const [openEvaluationId, setOpenEvaluationId] = useState<string | null>(
        null,
    )
    const [pendingDeleteSk, setPendingDeleteSk] = useState<string | null>(null)

    const handleDeleteRequest = (sk: string) => {
        if (isDeleting) return
        setPendingDeleteSk(sk)
    }

    const handleDeleteConfirm = () => {
        if (!pendingDeleteSk) return
        onDelete(pendingDeleteSk)
        setPendingDeleteSk(null)
    }

    const handleDeleteCancel = () => setPendingDeleteSk(null)

    const ActionColumn = ({
        sk,
        onView,
    }: {
        sk: string
        onView: () => void
    }) => (
        <div className="flex items-center justify-start gap-3">
            <div
                className="text-xl cursor-pointer select-none text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                role="button"
                onClick={onView}
            >
                <TbEye />
            </div>
            <div
                className={`text-xl select-none transition-colors ${
                    isDeleting
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'cursor-pointer text-gray-500 hover:text-red-500'
                }`}
                role="button"
                onClick={() => handleDeleteRequest(sk)}
            >
                <TbTrash />
            </div>
        </div>
    )

    const columns = useMemo<ColumnDef<TCollabEvaluation>[]>(
        () => [
            {
                header: t(
                    'collaborators.details.performanceEvaluationsTable.columns.evaluator',
                ),
                accessorKey: 'createdBy',
            },
            {
                header: t(
                    'collaborators.details.performanceEvaluationsTable.columns.type',
                ),
                accessorKey: 'type',
                cell: ({ row }) => (
                    <span>
                        {row.original.type}
                        {row.original.type === 'Por Servicio' &&
                            row.original.service && (
                                <span className="ml-1 text-gray-500 text-xs">
                                    ({row.original.service.serviceName})
                                </span>
                            )}
                    </span>
                ),
            },
            {
                header: t(
                    'collaborators.details.performanceEvaluationsTable.columns.date',
                ),
                accessorKey: 'createdAt',
                cell: ({ row }) =>
                    dayjs(row.original.createdAt).format('DD/MM/YYYY'),
            },
            {
                header: t(
                    'collaborators.details.performanceEvaluationsTable.columns.averageScore',
                ),
                accessorKey: 'result',
                cell: ({ row }) => (
                    <span className="font-semibold">
                        {averageScore(row.original.categories)} / 5
                    </span>
                ),
            },
            {
                header: t(
                    'collaborators.details.performanceEvaluationsTable.columns.actions',
                ),
                id: 'actions',
                cell: ({ row }) => (
                    <ActionColumn
                        sk={row.original.sk}
                        onView={() => setOpenEvaluationId(row.original.sk)}
                    />
                ),
            },
        ],
        [isDeleting, t],
    )

    const table = useReactTable({
        data: evaluations,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const openEvaluation = evaluations.find((e) => e.sk === openEvaluationId)

    return (
        <div className="overflow-x-auto">
            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th key={header.id} colSpan={header.colSpan}>
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
                    {table.getRowModel().rows.length === 0 ? (
                        <Tr>
                            <Td
                                colSpan={columns.length}
                                className="py-6 text-center text-gray-500"
                            >
                                {t(
                                    'collaborators.details.noPerformanceEvaluations',
                                )}
                            </Td>
                        </Tr>
                    ) : (
                        table.getRowModel().rows.map((row) => (
                            <Fragment key={row.id}>
                                <Tr>
                                    {row.getVisibleCells().map((cell) => (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Td>
                                    ))}
                                </Tr>
                            </Fragment>
                        ))
                    )}
                </TBody>
            </Table>

            <Dialog
                className="min-w-[70vw]"
                contentClassName="max-h-[80vh] overflow-y-auto"
                isOpen={!!openEvaluationId}
                onClose={() => setOpenEvaluationId(null)}
                onRequestClose={() => setOpenEvaluationId(null)}
            >
                <h4 className="text-lg font-semibold mb-4">
                    {t('collaborators.details.performanceEvaluationDetail')}
                </h4>
                {openEvaluation && (
                    <EvaluationForm
                        detail={openEvaluation.categories}
                        disabled
                    />
                )}
            </Dialog>

            <Dialog
                isOpen={!!pendingDeleteSk}
                onClose={handleDeleteCancel}
                onRequestClose={handleDeleteCancel}
            >
                <div className="flex flex-col gap-4 p-4">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {t(
                            'collaborators.details.performanceEvaluationsTable.deleteModal.title',
                        )}
                    </p>
                    <p className="text-sm text-gray-500">
                        {t(
                            'collaborators.details.performanceEvaluationsTable.deleteModal.description',
                        )}
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            disabled={isDeleting}
                            onClick={handleDeleteCancel}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="solid"
                            loading={isDeleting}
                            disabled={isDeleting}
                            onClick={handleDeleteConfirm}
                        >
                            {t('common.delete')}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default PerformanceEvaluationsTable
