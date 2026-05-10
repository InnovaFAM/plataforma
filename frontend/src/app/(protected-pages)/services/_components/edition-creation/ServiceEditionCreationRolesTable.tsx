'use client'

import { useState } from 'react'
import { TbPencil, TbTrash } from 'react-icons/tb'

import { TServiceRole } from '../../types'
import { Table, Button, Skeleton } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import ModalCreationRoles from './ModalCreationRoles'
import { useCan } from '@/hooks/useCan'
import ModalEditionRoles from './ModalEditionRoles'
import DialogDeleteRoleInService from './DialogDeleteRoleInService'
import { useServicesStore } from '../../_store/servicesStore'

const { Tr, Th, Td, THead, TBody } = Table

interface ServiceEditionCreationRolesTableProps {
    roles: TServiceRole[]
    isLoading?: boolean
    isEditing?: boolean
}

const ServiceEditionCreationRolesTable = ({
    roles,
    isLoading = false,
    isEditing = false,
}: ServiceEditionCreationRolesTableProps) => {
    const t = useTranslation()
    const canCreateRole = useCan('services.roles:create')
    console.log('roles', roles)

    const deleteRoleToCreate = useServicesStore(
        (state) => state.deleteRoleToCreate,
    )
    const [isModalOpen, setIsModalOpen] = useState<string | null>(null)
    const [temporalRole, setTemporalRole] = useState<TServiceRole | null>(null)

    const handleClose = () => {
        setIsModalOpen(null)
        setTemporalRole(null)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold">
                    {t('services.creation.addedRoles')}
                </h4>
                {canCreateRole && (
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                            setTemporalRole(null)
                            if (isEditing) {
                                setIsModalOpen('editing')
                            } else {
                                setIsModalOpen('normal')
                            }
                        }}
                    >
                        {t('common.add')}
                    </Button>
                )}
            </div>

            <Table className="w-full">
                <THead>
                    <Tr>
                        <Th>{t('services.creation.table.roleName')}</Th>
                        <Th>{t('services.creation.table.startDate')}</Th>
                        <Th>{t('services.creation.table.endDate')}</Th>
                        <Th>{t('services.common.requiredPeople')}</Th>
                        <Th className="text-right">
                            {t('services.creation.table.actions')}
                        </Th>
                    </Tr>
                </THead>
                <TBody>
                    {roles.length === 0 ? (
                        <Tr>
                            <Td colSpan={5} className="text-center py-4">
                                {isLoading ? (
                                    <div>
                                        <Skeleton className="w-full h-8 mb-4" />
                                        <Skeleton className="w-full h-8 mb-4" />
                                        <Skeleton className="w-full h-8 mb-4" />
                                    </div>
                                ) : (
                                    t('services.details.noRoles')
                                )}
                            </Td>
                        </Tr>
                    ) : (
                        roles.map((role, i) => (
                            <Tr key={`${role.roleName}-${i}`}>
                                <Td className="font-semibold text-black">
                                    {role.roleName}
                                </Td>
                                <Td>
                                    {getDayJsDate(
                                        role.startedAt,
                                        'DD MMMM YYYY',
                                    )}
                                </Td>
                                <Td>
                                    {getDayJsDate(role.endedAt, 'DD MMMM YYYY')}
                                </Td>
                                <Td>{role.required ?? '--'}</Td>
                                <Td>
                                    <div className="flex justify-end gap-3 text-xl">
                                        <TbPencil
                                            className="cursor-pointer hover:text-blue-600"
                                            onClick={() => {
                                                setTemporalRole(role)
                                                if (isEditing) {
                                                    setIsModalOpen('editing')
                                                } else {
                                                    setIsModalOpen('normal')
                                                }
                                            }}
                                        />
                                        <TbTrash
                                            className="cursor-pointer hover:text-red-600"
                                            onClick={() => {
                                                setTemporalRole(role)

                                                if (isEditing) {
                                                    setIsModalOpen('delete')
                                                } else {
                                                    deleteRoleToCreate(role)
                                                }
                                            }}
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))
                    )}
                </TBody>
            </Table>

            <ModalEditionRoles
                onClose={handleClose}
                roles={roles}
                isOpen={isModalOpen === 'editing'}
                temporalRole={temporalRole}
            />

            <ModalCreationRoles
                onClose={handleClose}
                roles={roles}
                isOpen={isModalOpen === 'normal'}
                temporalRole={temporalRole}
            />

            {isModalOpen === 'delete' && (
                <DialogDeleteRoleInService
                    isOpen={isModalOpen === 'delete'}
                    serviceId={temporalRole?.pk.split('#')[1] || ''}
                    roleHash={temporalRole?.sk.split('#')[1]}
                    roleName={temporalRole?.roleName || ''}
                    onClose={handleClose}
                />
            )}
        </div>
    )
}

export default ServiceEditionCreationRolesTable
