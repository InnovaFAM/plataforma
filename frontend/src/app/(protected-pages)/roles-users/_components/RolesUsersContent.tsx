'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import RolesUsersRolesSection from './RolesUsersRolesSection'
import useTranslation from '@/utils/hooks/useTranslation'
import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import RolesUsersUsersTable from './RolesUsersUsersTable'
import { useRolesUsersStore } from '../_store/rolesUsersStore'
import RolesUsersUsersTableTools from './RolesUsersTableTools'
import RolesUsersCreateUserModal from './RolesUsersCreateUserModal'
import { listData } from '@/server/actions/users/list-users'
import { usersKeys } from '@/server/actions/users/users-keys'
import { TSystemRole } from '../types'

interface RolesUsersContentProps {
    params: { [key: string]: string | string[] | undefined }
}
const RolesUsersContent = ({ params }: RolesUsersContentProps) => {
    const t = useTranslation()

    const { data: dataUserRoles } = useQuery({
        queryKey: usersKeys.data,
        queryFn: async () => {
            const response = await listData()

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
    })

    const { setFilterData } = useRolesUsersStore()
    const showCreateModal = useRolesUsersStore((state) => state.showCreateModal)
    const setShowCreateModal = useRolesUsersStore(
        (state) => state.setShowCreateModal,
    )

    const urlFilters = useMemo(() => {
        const decode = (val: string | string[] | undefined) =>
            val ? decodeURIComponent(String(val).replace(/\+/g, ' ')) : ''

        return {
            status: decode(params.status as string) as
                | 'activo'
                | 'inactivo'
                | 'pendiente',
            role: decode(params.role),
        }
    }, [params])

    const availableStatuses = useMemo(() => {
        return ['pendiente', 'activo', 'inactivo']
    }, [])

    useEffect(() => {
        setFilterData(urlFilters)
    }, [urlFilters, setFilterData])

    return (
        <div>
            <div className="mt-8">
                <RolesUsersRolesSection roleList={dataUserRoles?.roles || []} />
            </div>
            <div className="mt-8">
                <h4 className="mb-3">{t('rolesUsers.content.usersTitle')}</h4>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        {dataUserRoles && (
                            <RolesUsersUsersTableTools
                                roleOptions={dataUserRoles?.roles.map(
                                    (role: TSystemRole) => {
                                        return {
                                            label: role.name,
                                            value: role.sk,
                                        }
                                    },
                                )}
                                statusOptions={availableStatuses}
                            />
                        )}
                        <RolesUsersUsersTable
                            usersList={dataUserRoles?.users}
                            availableRoles={dataUserRoles?.roles || []}
                            pageIndex={
                                parseInt(params.pageIndex as string) || 1
                            }
                            pageSize={parseInt(params.pageSize as string) || 10}
                            searchValue={params.query as string}
                            filters={urlFilters}
                        />
                    </div>
                </AdaptiveCard>
            </div>
            <RolesUsersCreateUserModal
                availableRoles={dataUserRoles?.roles || []}
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </div>
    )
}

export default RolesUsersContent
