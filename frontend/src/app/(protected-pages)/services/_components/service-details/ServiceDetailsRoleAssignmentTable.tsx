'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'

import 'dayjs/locale/es'
import classNames from '@/utils/classNames'
import useTranslation from '@/utils/hooks/useTranslation'
import { TServiceRole } from '../../types'
import getUserAvailabilityText from '../../_utils/getUserAvailabilityText'
import getUserAvailabilityColor from '../../_utils/getUserAvailabilityColor'
import getUserAnnexesColor from '../../_utils/getUserAnnexesColor'
import getUserAnnexesText from '../../_utils/getUserAnnexesText'
import getUserAssignmentStatusColor from '../../_utils/getUserAssignmentStatusColor'
import { useQuery } from '@tanstack/react-query'
import { getCollaboratorsByRole } from '@/server/actions/collaborators/get-collabs-by-role'
import { collaboratorsKeys } from '@/server/actions/collaborators/collaborator-keys'
import { TCollabsByRole } from '@/app/(protected-pages)/collaborators/types'
import { useServicesStore } from '../../_store/servicesStore'
import TableEmptyState from '@/components/shared/TableEmptyState'
import { TbCheck, TbEye } from 'react-icons/tb'
import Link from 'next/link'
import ServiceDetailsRoleAssignmentDrawer from './ServiceDetailsRoleAssignmentDrawer'
import ClearanceCheckbox from './ClearanceCheckbox'
import { Progress } from '@/components/ui'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { useCan } from '@/hooks/useCan'

type ServiceDetailsRoleAssignmentTableProps = {
    fixedPagination?: boolean
    selectedRole?: TServiceRole
    // searchValue?: string
    // pageIndex?: number
    // pageSize?: number
    // filters?: Filter
}

const ServiceDetailsRoleAssignmentTable = ({
    fixedPagination,
    selectedRole,
    // pageIndex = 1,
    // pageSize = 10,
    // searchValue = '',
    // filters,
}: ServiceDetailsRoleAssignmentTableProps) => {
    const t = useTranslation()
    const canAssignCollab = useCan('services.roles.collabs:assign')
    const [selectedAssignmentUser, setSelectedAssignmentUser] =
        useState<TCollabsByRole | null>(null)
    const [isAssignmentDrawerOpen, setIsAssignmentDrawerOpen] = useState(false)
    const [initialAssignmentStatus, setInitialAssignmentStatus] = useState<
        'propuesto' | 'confirmado'
    >('propuesto')

    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const { onAppendQueryParams } = useAppendQueryParams()

    const roleAssignmentSearchValue = useServicesStore(
        (state) => state.roleAssignmentSearchValue,
    )
    const roleAssignmentFilterData = useServicesStore(
        (state) => state.roleAssignmentFilterData,
    )

    const openAssignmentDrawer = (
        collab: TCollabsByRole,
        status: 'propuesto' | 'confirmado' = 'propuesto',
    ) => {
        setSelectedAssignmentUser(collab)
        setInitialAssignmentStatus(status)
        setIsAssignmentDrawerOpen(true)
    }

    const closeAssignmentDrawer = () => {
        setSelectedAssignmentUser(null)
        setIsAssignmentDrawerOpen(false)
    }

    const { data: usersList, isLoading: isLoadingUsers } = useQuery({
        queryKey: collaboratorsKeys.byRole(
            selectedRole?.roleName || 'default-role',
        ),
        queryFn: async () => {
            if (selectedRole) {
                const response = await getCollaboratorsByRole(selectedRole)
                if (!response.success) {
                    throw new Error(response.error)
                }
                return response.data
            }

            throw Error('Role not selected')
        },
    })

    useEffect(() => {
        setPageIndex(1)
    }, [roleAssignmentSearchValue, roleAssignmentFilterData])

    const handlePaginationChange = (page: number) => {
        setPageIndex(page)
    }

    const handleSelectChange = (value: number) => {
        setPageSize(value)
        setPageIndex(1)
    }

    const handleSort = (sort: OnSortParam) => {
        onAppendQueryParams({
            order: sort.order,
            sortKey: sort.key,
        })
    }

    const ActionColumn = ({ row }: { row: TCollabsByRole }) => (
        <div className="flex items-center justify-start gap-3">
            <Link
                className="text-xl cursor-pointer select-none font-semibold"
                target="_blank"
                rel="noopener noreferrer"
                href={`/collaborators/${row.sk.split('#')[1]}`}
            >
                <TbEye />
            </Link>
            {canAssignCollab && (
                <button
                    type="button"
                    onClick={() => openAssignmentDrawer(row, 'propuesto')}
                    className="text-xl cursor-pointer select-none font-semibold"
                >
                    <TbCheck />
                </button>
            )}
        </div>
    )

    const getCollabRoleStatus = (row: TCollabsByRole) => {
        return (
            <>
                {row.status.indexOf('disponible') == -1 && (
                    <>
                        <span className="text-xs mb-1">
                            {`${row.startedAt} - ${row.endedAt}`}
                        </span>
                    </>
                )}
                <Tag
                    className={classNames(
                        'line-clamp-2 text-ellipsis overflow-hidden flex items-center capitalize justify-center w-max',
                        getUserAssignmentStatusColor(row.status),
                    )}
                >
                    {row.status}
                </Tag>
            </>
        )
    }

    const filterUsers = useCallback(
        (user: unknown) => {
            const matchesSearch =
                (user as TCollabsByRole).name
                    .toLowerCase()
                    .includes(roleAssignmentSearchValue.toLowerCase()) ||
                (user as TCollabsByRole).email
                    .toLowerCase()
                    .includes(roleAssignmentSearchValue.toLowerCase())

            const matchesStatus =
                roleAssignmentFilterData.status === 'all' ||
                roleAssignmentFilterData.status ==
                    (user as TCollabsByRole).status

            const matchesCompliance =
                roleAssignmentFilterData.compliance === 'all' ||
                (roleAssignmentFilterData.compliance == 'true' &&
                    (user as TCollabsByRole).compliance > 0)

            const matchesEvaluation =
                roleAssignmentFilterData.evaluation === 'all' ||
                (roleAssignmentFilterData.evaluation == 'true'
                    ? (user as TCollabsByRole).evaluations > 0
                    : (user as TCollabsByRole).evaluations === 0)

            const matchesAnnexes =
                !roleAssignmentFilterData?.annexes ||
                roleAssignmentFilterData.annexes === 'all' ||
                (user as TCollabsByRole).annex ===
                    (roleAssignmentFilterData.annexes === 'true')

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCompliance &&
                matchesEvaluation &&
                matchesAnnexes
            )
        },
        [roleAssignmentSearchValue, roleAssignmentFilterData],
    )

    const handledData = useMemo(() => {
        const filtered = usersList?.items.filter(filterUsers) || []
        const start = (pageIndex - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [usersList, pageIndex, pageSize, filterUsers])

    const columns: ColumnDef<TCollabsByRole>[] = useMemo(
        () => [
            {
                header: t('services.details.table.name'),
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center gap-2">
                            <Avatar
                                size={40}
                                shape="circle"
                                src={row.pictureUrl}
                            />
                            <div>
                                <div className="font-bold heading-text">
                                    {row.name}
                                </div>
                                <div>{row.email}</div>
                            </div>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.annexes'),
                size: 50,
                accessorKey: 'annexes',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag
                                className={classNames(
                                    'line-clamp-2 text-ellipsis overflow-hidden flex items-center justify-center',
                                    getUserAnnexesColor(row.annex),
                                )}
                            >
                                {getUserAnnexesText(row.annex, t)}
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.accreditation'),
                size: 50,
                accessorKey: 'accreditation',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <ClearanceCheckbox
                            user={row}
                            serviceRole={selectedRole}
                        />
                    )
                },
            },
            {
                header: t('services.details.table.evaluation'),
                accessorKey: 'evaluations',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag className="line-clamp-2 text-ellipsis overflow-hidden flex items-center justify-center bg-gray-100 gap-2">
                                <figure
                                    className={`flex items-center w-2 h-2 rounded-full ${getUserAvailabilityColor(row.evaluations)}`}
                                />
                                {getUserAvailabilityText(row.evaluations, t)}
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.compliance'),
                accessorKey: 'compliance',
                size: 70,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex flex-col items-start">
                            <span className="text-sm text-black font-bold mb-1">
                                {(row.compliance * 100 || 0).toFixed(2)}%
                            </span>
                            <Progress
                                className="w-full"
                                percent={Number(row.compliance) * 100 || 0}
                                showInfo={false}
                            />
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.status'),
                accessorKey: 'status',
                size: 150,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <div className="flex flex-col gap-1">
                                {getCollabRoleStatus(row)}
                            </div>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.actions'),
                accessorKey: 'actions',
                size: 70,
                cell: (props) => <ActionColumn row={props.row.original} />,
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [usersList],
    )

    return (
        <div className="relative h-full overflow-hidden">
            <div
                className={`
                h-full transition-all duration-300
                ${isAssignmentDrawerOpen ? 'pr-[420px]' : 'pr-0'}
            `}
            >
                <DataTable
                    fixedPagination={fixedPagination}
                    columns={columns}
                    data={handledData}
                    noData={!usersList || usersList?.items?.length === 0}
                    customNoDataIcon={<TableEmptyState />}
                    skeletonAvatarColumns={[0]}
                    skeletonAvatarProps={{ width: 28, height: 28 }}
                    loading={isLoadingUsers}
                    pagingData={{
                        total:
                            usersList?.items.filter((user) => filterUsers(user))
                                .length || 0,
                        //total: usersList?.items?.length || 0,
                        pageIndex,
                        pageSize,
                    }}
                    hidePagingOption
                    onPaginationChange={handlePaginationChange}
                    onSelectChange={handleSelectChange}
                    onSort={handleSort}
                />
            </div>

            <ServiceDetailsRoleAssignmentDrawer
                open={isAssignmentDrawerOpen}
                user={selectedAssignmentUser}
                initialStatus={initialAssignmentStatus}
                onClose={closeAssignmentDrawer}
                serviceRole={selectedRole!}
            />
        </div>
    )
}

export default ServiceDetailsRoleAssignmentTable
