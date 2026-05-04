'use client'

import { useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Tag } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import type { DashboardProjectsResponse } from '../types'
import { HiOutlinePlusCircle, HiOutlineMinusCircle } from 'react-icons/hi'

const { Tr, Th, Td, THead, TBody } = Table

type RoleRow = DashboardProjectsResponse['rolesTable'][number]

type ServiceGroupedRow = {
    rowType: 'service'
    serviceId: string
    serviceName: string
    requiredCount: number
    realCount: number
    gap: number
    missingCount: number
    surplusCount: number
    subRows: ServiceGroupedRoleRow[]
}

type ServiceGroupedRoleRow = {
    rowType: 'role'
    serviceId: string
    serviceName: string
    roleId: string
    roleSk: string
    roleName: string
    requiredCount: number
    confirmedCount: number
    proposedCount: number
    realCount: number
    gap: number
    missingCount: number
    surplusCount: number
    status: 'complete' | 'missing'
    startedAt: string
    endedAt?: string | null
}

type TableRow = ServiceGroupedRow | ServiceGroupedRoleRow

interface ProjectsPanelRolesTableProps {
    data?: DashboardProjectsResponse
}

const ProjectsPanelRolesTable = ({ data }: ProjectsPanelRolesTableProps) => {
    const t = useTranslation()
    const [expanded, setExpanded] = useState<ExpandedState>({})

    const tableData = useMemo<ServiceGroupedRow[]>(() => {
        const roles = data?.rolesTable ?? []

        const grouped = new Map<string, ServiceGroupedRow>()

        roles.forEach((role) => {
            const existing = grouped.get(role.serviceId)

            const roleRow: ServiceGroupedRoleRow = {
                rowType: 'role',
                serviceId: role.serviceId,
                serviceName: role.serviceName,
                roleId: role.roleId,
                roleSk: role.roleSk,
                roleName: role.roleName,
                requiredCount: role.requiredCount,
                confirmedCount: role.confirmedCount,
                proposedCount: role.proposedCount,
                realCount: role.realCount,
                gap: role.gap,
                missingCount: role.missingCount,
                surplusCount: role.surplusCount,
                status: role.status,
                startedAt: role.startedAt,
                endedAt: role.endedAt,
            }

            if (!existing) {
                grouped.set(role.serviceId, {
                    rowType: 'service',
                    serviceId: role.serviceId,
                    serviceName: role.serviceName,
                    requiredCount: role.requiredCount,
                    realCount: role.realCount,
                    gap: role.gap,
                    missingCount: role.missingCount,
                    surplusCount: role.surplusCount,
                    subRows: [roleRow],
                })
                return
            }

            existing.requiredCount += role.requiredCount
            existing.realCount += role.realCount
            existing.gap += role.gap
            existing.missingCount += role.missingCount
            existing.surplusCount += role.surplusCount
            existing.subRows.push(roleRow)
        })

        return Array.from(grouped.values())
            .map((service) => ({
                ...service,
                subRows: service.subRows.sort((a, b) => a.gap - b.gap),
            }))
            .sort((a, b) => a.gap - b.gap)
    }, [data])

    const columns = useMemo<ColumnDef<TableRow>[]>(
        () => [
            {
                id: 'expander',
                header: () => null,
                cell: ({ row }) => {
                    if (row.original.rowType !== 'service') {
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
                header: t('projectsPanel.content.table.roleColumn'),
                id: 'roleOrService',
                cell: ({ row }) => {
                    const original = row.original

                    if (original.rowType === 'service') {
                        return (
                            <div className="flex flex-col">
                                <span className="font-semibold">
                                    {original.serviceName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {original.subRows.length} roles
                                </span>
                            </div>
                        )
                    }

                    return (
                        <div
                            className="flex flex-col"
                            style={{ paddingLeft: `${row.depth * 1.5}rem` }}
                        >
                            <span className="font-medium">
                                {original.roleName}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('projectsPanel.content.table.requiredWorkersColumn'),
                accessorFn: (row) => row.requiredCount,
            },
            {
                header: t('projectsPanel.content.table.actualWorkersColumn'),
                accessorFn: (row) => row.realCount,
            },
            {
                header: t('projectsPanel.content.table.statusColumn'),
                id: 'status',
                cell: ({ row }) => {
                    const { gap, missingCount, rowType } = row.original

                    if (gap >= 0) {
                        return (
                            <Tag className="bg-emerald-100 text-emerald-500">
                                {rowType === 'service'
                                    ? t(
                                          'projectsPanel.content.table.statusComplete',
                                      )
                                    : t(
                                          'projectsPanel.content.table.statusComplete',
                                      )}
                            </Tag>
                        )
                    }

                    return (
                        <Tag className="bg-red-100 text-red-500">
                            {t('projectsPanel.content.table.statusVacancies', {
                                count: missingCount,
                            })}
                        </Tag>
                    )
                },
            },
        ],
        [t],
    )

    const table = useReactTable({
        data: tableData,
        columns,
        state: { expanded },
        onExpandedChange: setExpanded,
        getSubRows: (row) =>
            row.rowType === 'service' ? row.subRows : undefined,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return (
        <AdaptiveCard>
            <h4 className="text-lg font-semibold mb-4">
                {t('projectsPanel.content.table.rolesTableTitle')}
            </h4>

            <div className="overflow-x-auto">
                <Table bodyMaxHeight={420}>
                    <THead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => (
                                    <Th
                                        key={header.id}
                                        style={{
                                            width: `${index === 0 ? '20px' : ''}`,
                                        }}
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
                                    row.original.rowType === 'service'
                                        ? 'bg-gray-50/50 font-medium'
                                        : ''
                                }
                            >
                                {row.getVisibleCells().map((cell, index) => (
                                    <Td
                                        key={cell.id}
                                        style={{
                                            width: `${index === 0 ? '20px' : ''}`,
                                        }}
                                    >
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

export default ProjectsPanelRolesTable
