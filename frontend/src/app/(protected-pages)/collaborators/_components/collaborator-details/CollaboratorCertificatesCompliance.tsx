'use client'

import { Fragment, useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    HiOutlineChevronDown,
    HiOutlineChevronRight,
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineUpload,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
} from 'react-icons/hi'
import type { ColumnDef, Row } from '@tanstack/react-table'
import DialogCertificateDetail from './DialogCertificateDetail'
import { getCertificatePresignedUrl } from '@/server/actions/collaborators/get-presigned-url'
import { TCollaboratorCertificate, TCollaboratorEntity } from '../../types'
import DialogDeleteCertificate from './DialogDeleteCertificate'
import { useRouter } from 'next/navigation'
import { TCertificate } from '@/app/(protected-pages)/certifications/types'
import { useCan } from '@/hooks/useCan'

const { Tr, Th, Td, THead, TBody } = Table

type CollaboratorCertificatesComplianceProps = {
    data: TCollaboratorEntity
}

const formatDate = (value?: string) => {
    if (!value) return '-'

    const date = new Date(`${value}T00:00:00`)

    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

const clamp = (value: number, min = 0, max = 1) => {
    return Math.min(Math.max(value, min), max)
}

const normalizeCompliance = (
    compliance: TCollaboratorEntity['compliance'],
    uploadedCount: number,
    missingCount: number,
) => {
    const total = uploadedCount + missingCount
    const computed = total > 0 ? uploadedCount / total : 1

    if (
        compliance === undefined ||
        compliance === null ||
        compliance === undefined
    ) {
        return clamp(computed)
    }

    const parsed =
        typeof compliance === 'string' ? Number(compliance) : compliance

    if (!Number.isFinite(parsed)) return clamp(computed)

    return clamp(parsed > 1 ? parsed / 100 : parsed)
}

const getComplianceLabel = (value: number) => {
    if (value >= 0.85) return 'Alto cumplimiento'
    if (value >= 0.6) return 'Cumplimiento parcial'
    return 'Cumplimiento bajo'
}

const getComplianceBarClassName = (value: number) => {
    if (value >= 0.85) return 'bg-emerald-500'
    if (value >= 0.6) return 'bg-amber-500'
    return 'bg-red-500'
}

const isExpired = (expiredAt?: string) => {
    if (!expiredAt) return false

    const today = new Date()
    const expirationDate = new Date(`${expiredAt}T23:59:59`)

    return expirationDate < today
}

const StatusBadge = ({
    children,
    tone = 'neutral',
}: {
    children: string | string[]
    tone?: 'success' | 'warning' | 'danger' | 'neutral'
}) => {
    const toneClassName = {
        success:
            'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
        warning:
            'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
        danger: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300',
        neutral:
            'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-300',
    }[tone]

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${toneClassName}`}
        >
            {children}
        </span>
    )
}

const EmptyState = ({ message }: { message: string }) => {
    return (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
            {message}
        </div>
    )
}

const ComplianceSummary = ({
    uploadedCount,
    missingCount,
    totalCount,
    compliance,
}: {
    uploadedCount: number
    missingCount: number
    totalCount: number
    compliance: number
}) => {
    const percentage = Math.round(compliance * 100)

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <HiOutlineCheckCircle className="text-xl text-emerald-500" />
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Compliance de certificados
                            </h3>
                        </div>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Avance según certificados requeridos para el
                            colaborador.
                        </p>
                    </div>

                    <div className="text-left sm:text-right">
                        <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            {percentage}%
                        </div>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {getComplianceLabel(compliance)}
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                            className={`h-full rounded-full transition-all ${getComplianceBarClassName(
                                compliance,
                            )}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{uploadedCount} subidos</span>
                        <span>{missingCount} pendientes</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {totalCount}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Requeridos
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {uploadedCount}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Subidos
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                        {missingCount}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Pendientes
                    </div>
                </div>
            </div>
        </div>
    )
}

const MissingCertificatesTable = ({
    data,
    collaboratorId,
}: {
    data: TCertificate[]
    collaboratorId?: string
}) => {
    const canAddCertificate = useCan('collabs.certificates:create')
    const router = useRouter()
    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Certificados pendientes
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Documentos requeridos que aún no han sido cargados.
                    </p>
                </div>

                <div className="flex justify-end gap-4">
                    {data.length > 0 && (
                        <StatusBadge tone="danger">
                            {data.length.toString()} pendiente
                            {data.length === 1 ? '' : 's'}
                        </StatusBadge>
                    )}
                    {canAddCertificate && (
                        <button
                            type="button"
                            onClick={() => {
                                const id = collaboratorId?.split('#')[1] || ''
                                return router.push(
                                    `/collaborators/${encodeURIComponent(id)}?view=add-certification`,
                                )
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            <HiOutlineUpload />
                            Subir certificados
                        </button>
                    )}
                </div>
            </div>

            {data.length === 0 ? (
                <div className="p-5">
                    <EmptyState message="No hay certificados pendientes por subir." />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Código</Th>
                                <Th>Nombre</Th>
                                <Th>Tipo</Th>
                                <Th>Estado</Th>
                            </Tr>
                        </THead>

                        <TBody>
                            {data.map((certificate) => (
                                <Tr key={certificate.sk || certificate.code}>
                                    <Td>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">
                                            {certificate.code ||
                                                certificate.sk ||
                                                '-'}
                                        </span>
                                    </Td>

                                    <Td>
                                        <div className="max-w-[360px]">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {certificate.name}
                                            </div>
                                        </div>
                                    </Td>

                                    <Td>{certificate.type || '-'}</Td>

                                    <Td>
                                        <StatusBadge tone="warning">
                                            Falta subir
                                        </StatusBadge>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

const UploadedCertificatesTable = ({
    data,
    onViewCertificate,
    onDeleteCertificate,
}: {
    data: TCollaboratorCertificate[]
    onViewCertificate?: (certificate: TCollaboratorCertificate) => void
    onDeleteCertificate?: (certificate: TCollaboratorCertificate) => void
}) => {
    const columns = useMemo<ColumnDef<TCollaboratorCertificate>[]>(
        () => [
            {
                id: 'expander',
                header: () => null,
                cell: ({ row }) => {
                    if (!row.getCanExpand()) return null

                    return (
                        <button
                            type="button"
                            className="text-lg text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            onClick={row.getToggleExpandedHandler()}
                            aria-label={
                                row.getIsExpanded()
                                    ? 'Ocultar detalle'
                                    : 'Ver detalle'
                            }
                        >
                            {row.getIsExpanded() ? (
                                <HiOutlineChevronDown />
                            ) : (
                                <HiOutlineChevronRight />
                            )}
                        </button>
                    )
                },
            },
            {
                header: 'Nombre',
                accessorKey: 'name',
                cell: ({ row }) => (
                    <div className="max-w-[320px]">
                        <div className="line-clamp-2 font-medium text-gray-900 dark:text-gray-100">
                            {row.original.name}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Tipo',
                accessorKey: 'type',
            },
            {
                header: 'Fecha de inicio',
                accessorKey: 'createdAt',
                cell: ({ row }) => formatDate(row.original.createdAt),
            },
            {
                header: 'Fecha de expiración',
                accessorKey: 'expiredAt',
                cell: ({ row }) => {
                    const expired = isExpired(row.original.expiredAt)

                    return (
                        <div className="flex flex-col gap-1">
                            <span>{formatDate(row.original.expiredAt)}</span>
                            {expired ? (
                                <StatusBadge tone="danger">
                                    Expirado
                                </StatusBadge>
                            ) : (
                                <StatusBadge tone="success">
                                    Vigente
                                </StatusBadge>
                            )}
                        </div>
                    )
                },
            },
            {
                header: 'Institución',
                accessorKey: 'institution',
                cell: ({ row }) => (
                    <div className="max-w-[280px]">
                        {row.original.institution || '-'}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: 'Acciones',
                cell: ({ row }) => {
                    const certificate = row.original

                    return (
                        <div className="flex items-center gap-3 text-lg text-gray-500 dark:text-gray-400">
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onViewCertificate?.(
                                        certificate as TCollaboratorCertificate,
                                    )
                                }}
                                className="transition hover:text-blue-600"
                                aria-label="Ver certificado"
                            >
                                <HiOutlineEye />
                            </button>

                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onDeleteCertificate?.(
                                        certificate as TCollaboratorCertificate,
                                    )
                                }}
                                className="transition hover:text-red-600"
                                aria-label="Eliminar certificado"
                            >
                                <HiOutlineTrash />
                            </button>
                        </div>
                    )
                },
            },
        ],
        [onDeleteCertificate, onViewCertificate],
    )

    const table = useReactTable({
        data,
        columns,
        getRowCanExpand: (row) => Boolean(row.original.description),
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    const renderSubComponent = ({
        row,
    }: {
        row: Row<TCollaboratorCertificate>
    }) => {
        const certificate = row.original

        return (
            <div className="rounded-xl bg-gray-50 px-5 py-4 text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                <p className="leading-6">
                    {certificate.description || 'Sin descripción disponible.'}
                </p>

                {(certificate.key || certificate.sk) && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {certificate.sk && (
                            <span className="rounded-md bg-white px-2 py-1 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                                {certificate.sk}
                            </span>
                        )}

                        {certificate.key && (
                            <span className="rounded-md bg-white px-2 py-1 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                                {certificate.key}
                            </span>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Certificados subidos
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Documentos cargados y validados para este colaborador.
                    </p>
                </div>

                <StatusBadge tone="success">
                    {String(data.length)} subido{data.length === 1 ? '' : 's'}
                </StatusBadge>
            </div>

            {data.length === 0 ? (
                <div className="p-5">
                    <EmptyState message="Este colaborador aún no tiene certificados cargados." />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
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

                                    {row.getIsExpanded() && (
                                        <Tr>
                                            <Td
                                                colSpan={
                                                    row.getVisibleCells().length
                                                }
                                            >
                                                {renderSubComponent({ row })}
                                            </Td>
                                        </Tr>
                                    )}
                                </Fragment>
                            ))}
                        </TBody>
                    </Table>
                </div>
            )}
        </div>
    )
}

const CollaboratorCertificatesCompliance = ({
    data,
}: CollaboratorCertificatesComplianceProps) => {
    const uploadedCertificates = data.certificates?.uploaded || []
    const missingCertificates = data.certificates?.to_upload || []
    const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
    const [detailDialogIsOpen, setDetailDialogIsOpen] = useState(false)
    const [selectedCertificate, setSelectedCertificate] =
        useState<TCollaboratorCertificate | null>(null)
    const [presignedUrl, setPresignedUrl] = useState<string | null>(null)

    const uploadedCount = uploadedCertificates.length
    const missingCount = missingCertificates.length
    const totalCount = uploadedCount + missingCount

    const compliance = normalizeCompliance(
        data.compliance,
        uploadedCount,
        missingCount,
    )
    const handleViewCertificate = async (
        certificate: TCollaboratorCertificate,
    ) => {
        setDeleteDialogIsOpen(false)
        setDetailDialogIsOpen(true)
        setSelectedCertificate(certificate)
        setPresignedUrl(null)

        try {
            if (!certificate.key) {
                console.error('No file key available for this certificate')
                return
            }
            const result = await getCertificatePresignedUrl(certificate.key)
            if (result.success && result.presignedUrl) {
                setPresignedUrl(result.presignedUrl)
            } else {
                console.error('Error obteniendo la URL:', result.error)
            }
        } catch (error) {
            console.error('Error de red o servidor:', error)
        }
    }

    const handleDeleteCertificate = async (
        certificate: TCollaboratorCertificate,
    ) => {
        setDeleteDialogIsOpen(true)
        setSelectedCertificate(certificate)
        setDetailDialogIsOpen(false)
        setPresignedUrl(null)
    }

    const handleModalClose = () => {
        setDeleteDialogIsOpen(false)
        setDetailDialogIsOpen(false)
        setSelectedCertificate(null)
        setPresignedUrl(null)
    }

    return (
        <section className="space-y-5">
            <ComplianceSummary
                uploadedCount={uploadedCount}
                missingCount={missingCount}
                totalCount={totalCount}
                compliance={compliance}
            />

            {missingCount > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                        <HiOutlineExclamationCircle className="mt-0.5 text-lg" />
                        <p>
                            Este colaborador tiene certificados requeridos
                            pendientes. Al subirlos, el compliance aumentará
                            automáticamente.
                        </p>
                    </div>
                </div>
            )}

            <MissingCertificatesTable
                data={missingCertificates}
                collaboratorId={data.sk}
            />

            <UploadedCertificatesTable
                data={uploadedCertificates}
                onViewCertificate={handleViewCertificate}
                onDeleteCertificate={handleDeleteCertificate}
            />
            <DialogCertificateDetail
                isOpen={detailDialogIsOpen && Boolean(selectedCertificate)}
                selectedCertification={selectedCertificate}
                presignedUrl={presignedUrl}
                handleModalClose={handleModalClose}
            />
            <DialogDeleteCertificate
                isOpen={deleteDialogIsOpen && Boolean(selectedCertificate)}
                collaboratorId={data.sk?.split('#')[1]}
                certificateSk={selectedCertificate?.sk}
                certificateName={selectedCertificate?.name}
                onClose={handleModalClose}
            />
        </section>
    )
}

export default CollaboratorCertificatesCompliance
