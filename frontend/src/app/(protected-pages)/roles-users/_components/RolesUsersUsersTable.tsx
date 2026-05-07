'use client'

import { useCallback, useMemo } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import Dropdown from '@/components/ui/Dropdown'
import DataTable from '@/components/shared/DataTable'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbChevronDown } from 'react-icons/tb'
import type { ColumnDef, OnSortParam, Row } from '@/components/shared/DataTable'
import { TUser, Filter, TSystemRole } from '../types'
import { useRolesUsersStore } from '../_store/rolesUsersStore'
import getStatusColor from '../_utils/getStatusColor'
import useTranslation from '@/utils/hooks/useTranslation'
import 'dayjs/locale/es'
import classNames from '@/utils/classNames'

type RolesUsersUsersTableProps = {
    availableRoles: TSystemRole[]
    usersList?: TUser[]
    searchValue?: string
    pageIndex?: number
    pageSize?: number
    filters?: Filter
}

const RolesUsersUsersTable = ({
    usersList,
    availableRoles,
    pageIndex = 1,
    pageSize = 10,
    searchValue = '',
    filters,
}: RolesUsersUsersTableProps) => {
    const t = useTranslation()
    const { onAppendQueryParams } = useAppendQueryParams()

    const selectedUsers = useRolesUsersStore((state) => state.selectedUsers)
    const setSelectAllUsers = useRolesUsersStore(
        (state) => state.setSelectAllUsers,
    )
    const setSelectedUsers = useRolesUsersStore(
        (state) => state.setSelectedUsers,
    )

    const handlePaginationChange = (page: number) => {
        onAppendQueryParams({
            pageIndex: String(page),
        })
    }

    const handleSelectChange = (value: number) => {
        onAppendQueryParams({
            pageSize: String(value),
            pageIndex: '1',
        })
    }

    const handleSort = (sort: OnSortParam) => {
        onAppendQueryParams({
            order: sort.order,
            sortKey: sort.key,
        })
    }

    const handleRowSelect = (checked: boolean, row: TUser) => {
        setSelectedUsers(checked, row)
    }

    const handleAllRowSelect = (checked: boolean, rows: Row<TUser>[]) => {
        if (checked) {
            const originalRows = rows.map((row) => row.original)
            setSelectAllUsers(originalRows)
        } else {
            setSelectAllUsers([])
        }
    }

    const handleUpdateRole = (userId: string, newRoleId: string) => {
        console.log(userId, newRoleId)
    }

    const filterUsers = useCallback(
        (user: TUser) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchValue.toLowerCase())

            const matchesRole =
                !filters?.role || user.parentId === filters?.role

            const matchesStatus =
                !filters?.status || user.status === filters?.status

            return matchesSearch && matchesRole && matchesStatus
        },
        [searchValue, filters],
    )

    const handledData = useMemo(() => {
        const filtered = usersList?.filter(filterUsers)
        const start = (pageIndex - 1) * pageSize
        return filtered?.slice(start, start + pageSize)
    }, [usersList, pageIndex, pageSize, filterUsers])

    const handleDeselectAll = () => {
        setSelectAllUsers([])
    }

    const columns: ColumnDef<TUser>[] = useMemo(
        () => [
            {
                header: t('rolesUsers.content.userTable.name'),
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
                header: t('rolesUsers.content.userTable.status'),
                accessorKey: 'status',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex items-center">
                            <Tag
                                className={classNames(
                                    'capitalize line-clamp-2 text-ellipsis overflow-hidden flex items-center justify-center',
                                    getStatusColor(row.status),
                                )}
                            >
                                {row.status}
                            </Tag>
                        </div>
                    )
                },
            },
            {
                header: t('rolesUsers.content.userTable.lastLogin'),
                accessorKey: 'lastOnline',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold capitalize">
                                {row.lastLogin || '-'}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('rolesUsers.content.userTable.role'),
                accessorKey: 'role',
                size: 70,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <Dropdown
                            disabled
                            renderTitle={
                                <div
                                    className="inline-flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    role="button"
                                >
                                    <span className="font-bold heading-text">
                                        {
                                            availableRoles.find(
                                                (role) =>
                                                    role.sk === row.parentId,
                                            )?.name
                                        }
                                    </span>
                                    <TbChevronDown />
                                </div>
                            }
                        >
                            {availableRoles.map((role: TSystemRole) => (
                                <Dropdown.Item
                                    key={role.sk}
                                    eventKey={role.sk}
                                    onClick={() =>
                                        handleUpdateRole(role.sk, row.sk)
                                    }
                                >
                                    {role.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown>
                    )
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [usersList],
    )

    return (
        <>
            <DataTable
                selectable
                columns={columns}
                data={handledData}
                noData={usersList && usersList.length === 0}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ width: 28, height: 28 }}
                loading={usersList == undefined}
                pagingData={{
                    total: usersList
                        ? usersList.filter((user) => filterUsers(user)).length
                        : 0,
                    pageIndex,
                    pageSize,
                }}
                checkboxChecked={(row) =>
                    selectedUsers.some((selected) => selected.sk === row.sk)
                }
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
                onCheckBoxChange={handleRowSelect}
                onIndeterminateCheckBoxChange={handleAllRowSelect}
                onDeselectAll={handleDeselectAll}
            />
        </>
    )
}

export default RolesUsersUsersTable
