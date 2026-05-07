'use client'

import { useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tooltip from '@/components/ui/Tooltip'
import DataTable from '@/components/shared/DataTable'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useRouter } from 'next/navigation'
import { TbClipboardCheck, TbEye, TbPencil } from 'react-icons/tb'
import type { OnSortParam, ColumnDef, Row } from '@/components/shared/DataTable'
import type { Filter, TService } from '../types'
import { useServicesStore } from '../_store/servicesStore'
import { Tag } from '@/components/ui'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import { getStatusColor } from '../_utils/getStatusColor'
import useTranslation from '@/utils/hooks/useTranslation'
import getStatusText from '../_utils/getStatusText'
import classNames from '@/utils/classNames'
import TableEmptyState from '@/components/shared/TableEmptyState'
import { useClickCoolDown } from '@/utils/hooks/useClickCooldown'
import { useServicesPagination } from '../_utils/useServicesPagination'

type ServicesListTableProps = {
    pageSize?: number
    searchValue?: string
    filters?: Filter
}

const handleAddToRecentVisitedServices = (id: string) => {
    if (typeof window === 'undefined') return
    const item = localStorage.getItem('recently-visited-services')
    let recentVisitedServiceIds: string[] = item ? JSON.parse(item) : []
    recentVisitedServiceIds = recentVisitedServiceIds.filter(
        (serviceId) => serviceId !== id,
    )
    recentVisitedServiceIds.push(id)
    if (recentVisitedServiceIds.length > 4) {
        recentVisitedServiceIds = recentVisitedServiceIds.slice(-4)
    }
    localStorage.setItem(
        'recently-visited-services',
        JSON.stringify(recentVisitedServiceIds),
    )
}

const ServiceColumn = ({ row }: { row: TService }) => (
    <div className="flex items-center gap-2 text-xs">
        <Avatar shape="round" size={45}>
            {row.name.charAt(0)}
        </Avatar>
        <div>
            <p className="font-bold heading-text mb-1 line-clamp-2 text-ellipsis overflow-hidden">
                {row.name}
            </p>
            <Tooltip title={row.sk}>
                <span className="block whitespace-nowrap overflow-hidden text-ellipsis max-w-30 cursor-default">
                    ID: {row.code || row.sk}
                </span>
            </Tooltip>
        </div>
    </div>
)

const ActionColumn = ({
    onEdit,
    onView,
}: {
    onEdit: () => void
    onView: () => void
}) => (
    <div className="flex items-center justify-start gap-3">
        <div
            className={classNames(
                'text-xl cursor-pointer select-none font-semibold',
            )}
            role="button"
            onClick={onEdit}
        >
            <TbPencil />
        </div>
        <div
            className={classNames(
                'text-xl cursor-pointer select-none font-semibold',
            )}
            role="button"
            onClick={onView}
        >
            <TbEye />
        </div>
    </div>
)

const ServicesListTable = ({
    pageSize: pageSizeProp = 10,
    searchValue = '',
    filters,
}: ServicesListTableProps) => {
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
    } = useServicesPagination({ pageSize, searchValue, filters })

    const selectedServices = useServicesStore((state) => state.selectedServices)
    const setSelectAllServices = useServicesStore(
        (state) => state.setSelectAllServices,
    )
    const setSelectedServices = useServicesStore(
        (state) => state.setSelectedServices,
    )

    const handleEdit = (service: TService) => {
        const id = service?.sk?.split('#')[1]
        router.push(`/services/${encodeURIComponent(id)}?view=edit`)
    }

    const handleView = (service: TService) => {
        const id = service?.sk?.split('#')[1]

        handleAddToRecentVisitedServices(service.sk)
        router.push(`/services/${encodeURIComponent(id)}`)
    }

    const columns: ColumnDef<TService>[] = useMemo(
        () => [
            {
                header: t('services.table.columnService'),
                accessorKey: 'service',
                cell: (props) => <ServiceColumn row={props.row.original} />,
            },
            {
                header: t('services.table.columnClient'),
                accessorKey: 'client',
                cell: (props) => (
                    <span className="font-bold heading-text line-clamp-2 text-ellipsis overflow-hidden">
                        {props.row.original.client?.name}
                    </span>
                ),
            },
            {
                header: t('services.table.columnChore'),
                accessorKey: 'chore.name',
                cell: (props) => (
                    <span className="font-bold heading-text line-clamp-2 text-ellipsis overflow-hidden">
                        {props.row.original.chore?.name}
                    </span>
                ),
            },
            {
                header: t('services.table.columnAdc'),
                accessorKey: 'ADC',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <b className="font-bold heading-text flex items-center min-w-[120px] line-clamp-2 text-ellipsis overflow-hidden">
                            {row.managers?.[0]?.name || '–'}
                            {(row.managers?.length || 0) > 1 && (
                                <Tooltip
                                    title={row.managers
                                        ?.map((m) => m.name)
                                        .join(', ')}
                                >
                                    <span className="text-gray-500 font-normal ml-1 rtl:mr-1 text-sm bg-gray-100 px-1.5 py-0.5 rounded-full cursor-help">
                                        +{row.managers!.length - 1}
                                    </span>
                                </Tooltip>
                            )}
                        </b>
                    )
                },
            },
            {
                header: t('services.table.columnEndDate'),
                id: 'endDate',
                cell: (props) => (
                    <div className="flex items-center rounded-full font-semibold text-xs">
                        <div className="flex items-center px-2 py-1 border border-gray-300 rounded-full">
                            <TbClipboardCheck className="text-base" />
                            <span className="whitespace-nowrap ml-1">
                                {getDayJsDate(props.row.original.endDate)}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                header: t('services.table.columnStatus'),
                id: 'status',
                cell: (props) => {
                    const status = props.row.original.status
                    return (
                        <Tag
                            className={classNames(
                                'whitespace-nowrap',
                                getStatusColor(status || ''),
                            )}
                        >
                            {getStatusText(status || undefined, t)}
                        </Tag>
                    )
                },
            },
            {
                header: t('services.table.columnActions'),
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => handleEdit(props.row.original)}
                        onView={() => handleView(props.row.original)}
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [t, pagedItems, pageSize, selectedServices],
    )

    const handleSort = (sort: OnSortParam) => {
        onAppendQueryParams({
            order: sort.order,
            sortKey: sort.key,
        })
    }

    const handleRowSelect = (checked: boolean, row: TService) => {
        setSelectedServices(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<TService>[]) => {
        if (checked) {
            setSelectAllServices(rows.map((row) => row.original))
        } else {
            setSelectAllServices([])
        }
    }

    return (
        <DataTable<TService>
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
                selectedServices.some((selected) => selected.sk === row.sk)
            }
            onSort={handleSort}
            onCheckBoxChange={handleRowSelect}
            onIndeterminateCheckBoxChange={handleAllRowSelect}
            onDeselectAll={() => setSelectAllServices([])}
        />
    )
}

export default ServicesListTable
