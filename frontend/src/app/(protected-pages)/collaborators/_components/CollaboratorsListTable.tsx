'use client'
import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbEye } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Filter, TCollaboratorEntity } from '../types'
import { useCollaboratorsStore } from '../_store/collaboratorsStore'
import { Tag } from '@/components/ui'
import getStatusColor from '../_utils/getStatusColor'
import useTranslation from '@/utils/hooks/useTranslation'
import getStatusText from '../_utils/getStatusText'
import classNames from '@/utils/classNames'
import { useRouter } from 'next/navigation'
import TableEmptyState from '@/components/shared/TableEmptyState'
import { useClickCoolDown } from '@/utils/hooks/useClickCooldown'
import { useCollaboratorsPagination } from '../_utils/useCollaboratorsPagination'

type CollaboratorsListTableProps = {
    pageSize?: number
    searchValue?: string
    filters?: Filter
}

const CollaboratorColumn = ({ row }: { row: TCollaboratorEntity }) => (
    <div className="flex items-center gap-2 text-xs">
        <Avatar
            shape="circle"
            size={45}
            {...(row.pictureUrl ? { src: row.pictureUrl } : undefined)}
        >
            {!row.pictureUrl ? row.name?.charAt(0) : null}
        </Avatar>
        <div>
            <p className="font-bold heading-text mb-1 line-clamp-2 text-ellipsis overflow-hidden">
                {row.name}
            </p>
            <span className="block whitespace-nowrap overflow-hidden text-ellipsis max-w-30 cursor-default">
                {row.position || '–'}
            </span>
        </div>
    </div>
)

const ActionColumn = ({ onView }: { onView: () => void }) => (
    <div className="flex items-center justify-start gap-3">
        <div
            className="text-xl cursor-pointer select-none font-semibold"
            role="button"
            onClick={onView}
        >
            <TbEye />
        </div>
    </div>
)

const CollaboratorsListTable = ({
    pageSize: pageSizeProp = 10,
    searchValue = '',
    filters,
}: CollaboratorsListTableProps) => {
    const router = useRouter()
    const t = useTranslation()
    const { onAppendQueryParams } = useAppendQueryParams()
    const { blocked: navBlocked, trigger: triggerNav } = useClickCoolDown(250)
    const [pageSize, setPageSize] = useState(pageSizeProp)

    const {
        pagedItems,
        isLoading,
        isFetching,
        isFirstPage,
        hasNextPage,
        isEmpty,
        currentPageNumber,
        goNext,
        goPrev,
    } = useCollaboratorsPagination({ pageSize, searchValue, filters })

    const selectedCollaborators = useCollaboratorsStore(
        (state) => state.selectedCollaborators,
    )
    const setSelectAllCollaborators = useCollaboratorsStore(
        (state) => state.setSelectAllCollaborators,
    )
    const setSelectedCollaborators = useCollaboratorsStore(
        (state) => state.setSelectedCollaborators,
    )

    const handleView = (collaborator: TCollaboratorEntity) => {
        const id = collaborator.sk.split('#')[1]
        router.push(`/collaborators/${id}`)
    }

    const handleSort = (sort: OnSortParam) => {
        onAppendQueryParams({ order: sort.order, sortKey: sort.key })
    }

    const handleRowSelect = (checked: boolean, row: TCollaboratorEntity) => {
        setSelectedCollaborators(checked, row)
    }

    const handleAllRowSelect = (
        checked: boolean,
        rows: Row<TCollaboratorEntity>[],
    ) => {
        if (checked) {
            setSelectAllCollaborators(rows.map((row) => row.original))
        } else {
            setSelectAllCollaborators([])
        }
    }

    const handleDeselectAll = () => {
        setSelectAllCollaborators([])
    }

    const columns: ColumnDef<TCollaboratorEntity>[] = useMemo(
        () => [
            {
                header: t('collaborators.table.name'),
                accessorKey: 'name',
                cell: (props) => (
                    <CollaboratorColumn row={props.row.original} />
                ),
            },
            {
                header: t('collaborators.table.rut'),
                accessorKey: 'rut',
                cell: (props) => (
                    <span className="heading-text line-clamp-2 text-ellipsis overflow-hidden text-gray-400 font-semibold">
                        {props.row.original.rut || '–'}
                    </span>
                ),
            },
            {
                header: t('collaborators.table.location'),
                accessorKey: 'address',
                cell: (props) => (
                    <span className="heading-text line-clamp-2 text-ellipsis overflow-hidden text-gray-400 font-semibold">
                        {props.row.original.address || '–'}
                    </span>
                ),
            },
            {
                header: t('collaborators.table.status'),
                id: 'status',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <Tag
                            className={classNames(
                                'whitespace-nowrap',
                                getStatusColor(
                                    row.status ? 'active' : 'inactive',
                                ),
                            )}
                        >
                            {getStatusText(
                                row.status ? 'active' : 'inactive',
                                t,
                            )}
                        </Tag>
                    )
                },
            },
            {
                header: t('collaborators.table.assignation'),
                id: 'assignments',
                cell: (props) => {
                    const row = props.row.original
                    const firstName = row.assignments?.[0]?.serviceName
                    return (
                        <Tooltip
                            title={row.assignments
                                ?.map(
                                    (a: { serviceName: string }) =>
                                        a.serviceName,
                                )
                                .join(', ')}
                        >
                            <Tag className="heading-text flex justify-center text-center items-center line-clamp-2 text-ellipsis overflow-hidden">
                                {firstName
                                    ? `${firstName.substring(0, 20)}${firstName.length > 20 ? '...' : ''}`
                                    : '–'}
                                {(row.assignments?.length || 0) > 1 && (
                                    <span className="text-gray-500 font-normal ml-1 rtl:mr-1 text-sm bg-gray-100 px-1.5 py-0.5 rounded-full cursor-help">
                                        +{(row.assignments?.length || 0) - 1}
                                    </span>
                                )}
                            </Tag>
                        </Tooltip>
                    )
                },
            },
            {
                header: t('collaborators.table.actions'),
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onView={() => handleView(props.row.original)}
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [t, pagedItems, pageSize, selectedCollaborators],
    )

    return (
        <div>
            <DataTable<TCollaboratorEntity>
                selectable
                columns={columns}
                data={pagedItems}
                noData={isEmpty}
                customNoDataIcon={<TableEmptyState />}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={isLoading || isFetching}
                pagingData={{
                    total: pagedItems.length,
                    pageIndex: 1,
                    pageSize,
                }}
                pageSizes={[5, 10, 25, 50]}
                arrowPagination
                currentPageNumber={currentPageNumber}
                onPrevPage={() => triggerNav(goPrev)}
                onNextPage={() => triggerNav(goNext)}
                disablePrevPage={isFirstPage || isEmpty || navBlocked}
                disableNextPage={!hasNextPage || isEmpty || navBlocked}
                onSelectChange={(value) => {
                    setPageSize(value)
                    onAppendQueryParams({ pageSize: String(value) })
                }}
                checkboxChecked={(row) =>
                    selectedCollaborators.some((s) => s.sk === row.sk)
                }
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
                onDeselectAll={handleDeselectAll}
            />
        </div>
    )
}

export default CollaboratorsListTable
