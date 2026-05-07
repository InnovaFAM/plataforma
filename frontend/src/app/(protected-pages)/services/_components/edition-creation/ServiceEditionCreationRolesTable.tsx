'use client'

import { useState } from 'react'
import { TbPencil, TbTrash } from 'react-icons/tb'

import { TServiceRole } from '../../types'
import { Table, Button, Skeleton } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import ModalCreationRoles from './ModalCreationRoles'
import { useCan } from '@/hooks/useCan'

const { Tr, Th, Td, THead, TBody } = Table

interface ServiceEditionCreationRolesTableProps {
    roles: TServiceRole[]
    isLoading?: boolean
}

const ServiceEditionCreationRolesTable = ({
    roles,
    isLoading = false,
}: ServiceEditionCreationRolesTableProps) => {
    const t = useTranslation()
    const canCreateRole = useCan('services.roles:create')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [temporalRole, setTemporalRole] = useState<TServiceRole | null>(null)

    const handleDelete = () => {}

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
                            setIsModalOpen(true)
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
                                                setIsModalOpen(true)
                                            }}
                                        />
                                        <TbTrash
                                            className="cursor-pointer hover:text-red-600"
                                            onClick={handleDelete}
                                        />
                                    </div>
                                </Td>
                            </Tr>
                        ))
                    )}
                </TBody>
            </Table>
            {/**
           *
           <ModalEditionCreationRoles
               onClose={() => {
                   setIsModalOpen(false)
                   setTemporalRole(null)
               }}
               roles={roles}
               isOpen={isModalOpen}
               temporalRole={temporalRole}
           />
           */}

            <ModalCreationRoles
                onClose={() => {
                    setIsModalOpen(false)
                    setTemporalRole(null)
                }}
                roles={roles}
                isOpen={isModalOpen}
                temporalRole={temporalRole}
            />
        </div>
    )
}

export default ServiceEditionCreationRolesTable
