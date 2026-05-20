'use client'

import { useCallback, useMemo, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Tag from '@/components/ui/Tag'
import DataTable from '@/components/shared/DataTable'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbPencil, TbTrash, TbUserCancel, TbUserCheck } from 'react-icons/tb'
import type { ColumnDef, OnSortParam } from '@/components/shared/DataTable'
import { TUser, Filter, TSystemRole } from '../types'
import getStatusColor from '../_utils/getStatusColor'
import useTranslation from '@/utils/hooks/useTranslation'
import 'dayjs/locale/es'
import classNames from '@/utils/classNames'
import dayjs from 'dayjs'
import RolesUsersEditUserModal from './RolesUsersEditUserModal'
import DialogDeleteUser from './DialogDeleteUser'
import DialogStatusUser from './DialogStatusUser'

type RolesUsersUsersTableProps = {
    availableRoles: TSystemRole[]
    usersList?: TUser[]
    searchValue?: string
    pageIndex?: number
    pageSize?: number
    filters?: Filter
}

const ActionColumn = ({
    onEdit,
    onDelete,
    onToggle,
    userStatus,
}: {
    onEdit: () => void
    onDelete: () => void
    onToggle: () => void
    userStatus: 'activo' | 'inactivo' | 'pendiente'
}) => (
    <div className="flex items-center justify-start gap-3">
        <div
            className="text-xl cursor-pointer select-none font-semibold"
            role="button"
            onClick={onEdit}
        >
            <TbPencil />
        </div>
        <div
            className="text-xl cursor-pointer select-none font-semibold"
            role="button"
            onClick={onDelete}
        >
            <TbTrash />
        </div>
        <div
            className={classNames(
                'text-xl cursor-pointer select-none font-semibold',
                {
                    'opacity-50': userStatus === 'pendiente',
                    'cursor-not-allowed': userStatus === 'pendiente',
                },
            )}
            role="button"
            onClick={userStatus !== 'pendiente' ? onToggle : undefined}
        >
            {userStatus === 'activo' ? <TbUserCancel /> : <TbUserCheck />}
        </div>
    </div>
)

const RolesUsersUsersTable: React.FC<RolesUsersUsersTableProps> = ({
    usersList,
    availableRoles,
    pageIndex = 1,
    pageSize = 10,
    searchValue = '',
    filters,
}) => {
    const t = useTranslation()
    const { onAppendQueryParams } = useAppendQueryParams()
    const [selectedUser, setSelectUser] = useState<TUser | null>(null)
    const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState<boolean>(false)
    const [editDialogIsOpen, setEditDialogIsOpen] = useState<boolean>(false)
    const [statusDialogIsOpen, setStatusDialogIsOpen] = useState<boolean>(false)

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

    const columns: ColumnDef<TUser>[] = useMemo(
        () => [
            {
                header: t('rolesUsers.content.userTable.name'),
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div
                            className="flex items-center gap-2"
                            style={{ maxWidth: 200 }}
                        >
                            <Avatar
                                size={40}
                                shape="circle"
                                src={row.pictureUrl}
                            />
                            <div className="grid">
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
                size: 80,
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
                size: 180,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold capitalize">
                                {row.lastLogin
                                    ? dayjs(row.lastLogin).format(
                                          'YYYY-MM-DD HH:mm:ss',
                                      )
                                    : '-'}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('rolesUsers.content.userTable.role'),
                accessorKey: 'role',
                size: 150,
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <span className="font-bold heading-text">
                            {
                                availableRoles.find(
                                    (role) => role.sk === row.parentId,
                                )?.name
                            }
                        </span>
                    )
                },
            },
            {
                header: t('collaborators.table.actions'),
                id: 'action',
                cell: (props) => (
                    <ActionColumn
                        onEdit={() => {
                            setSelectUser(props.row.original)
                            setEditDialogIsOpen(true)
                        }}
                        onDelete={() => {
                            setSelectUser(props.row.original)
                            setDeleteDialogIsOpen(true)
                        }}
                        userStatus={props.row.original.status}
                        onToggle={() => {
                            setSelectUser(props.row.original)
                            setStatusDialogIsOpen(true)
                        }}
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [usersList],
    )

    return (
        <>
            <DataTable
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
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
            />
            {editDialogIsOpen && (
                <RolesUsersEditUserModal
                    availableRoles={availableRoles || []}
                    selectedUser={selectedUser}
                    isOpen={editDialogIsOpen && Boolean(selectedUser)}
                    onClose={() => {
                        setEditDialogIsOpen(false)
                        setSelectUser(null)
                    }}
                />
            )}
            {deleteDialogIsOpen && (
                <DialogDeleteUser
                    isOpen={deleteDialogIsOpen && Boolean(selectedUser)}
                    selectedUser={selectedUser}
                    onClose={() => {
                        setDeleteDialogIsOpen(false)
                        setSelectUser(null)
                    }}
                />
            )}
            {statusDialogIsOpen && (
                <DialogStatusUser
                    isOpen={statusDialogIsOpen && Boolean(selectedUser)}
                    selectedUser={selectedUser}
                    onClose={() => {
                        setStatusDialogIsOpen(false)
                        setSelectUser(null)
                    }}
                />
            )}
        </>
    )
}

export default RolesUsersUsersTable
