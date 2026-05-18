import { TCollabsByRole } from '@/app/(protected-pages)/collaborators/types'
import { Button, DatePicker, toast, Notification } from '@/components/ui'
import CloseButton from '@/components/ui/CloseButton'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
    TServiceRole,
    TServiceRoleAssignment,
    TServiceRoleAssignmentUpdatePayload,
} from '../../types'
import {
    addCollabToRoleInService,
    deleteCollabToRoleInService,
    updateCollabToRoleInService,
} from '@/server/actions/services/add-collab-to-role-in-service'
import { serviceKeys } from '@/server/actions/services/service-keys'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import dayjs from 'dayjs'
import { getDateFromString } from '../../_utils/getDateFromString'
import { updateUserInList } from '../../_utils/updateUserInList'

type AssignmentStatus = 'propuesto' | 'confirmado'

type RoleAssignmentDrawerProps = {
    open: boolean
    user: TCollabsByRole | null
    serviceRole: TServiceRole | null
    initialStatus: AssignmentStatus
    onClose: () => void
}

const ServiceDetailsRoleAssignmentDrawer = ({
    open,
    user,
    serviceRole,
    onClose,
}: RoleAssignmentDrawerProps) => {
    const queryClient = useQueryClient()
    const [dateRange, setDateRange] = useState<
        [Date | undefined, Date | undefined]
    >([
        user?.startedAt ? getDateFromString(user.startedAt) : undefined,
        user?.endedAt ? getDateFromString(user.endedAt) : undefined,
    ])

    const [status, setStatus] = useState<'propuesto' | 'confirmado'>(
        user?.status == 'propuesto' ? 'propuesto' : 'confirmado',
    )

    const userName = user?.name || 'Colaborador'

    const userEmail = user?.email || ''

    const userId = user?.sk

    const canSubmit = Boolean(userId && dateRange)

    const assignMutation = useMutation({
        mutationFn: async (item: TServiceRoleAssignment) => {
            const serviceHash = item.parentId.split('#')[1]
            const roleHash = item.entityId.split('#')[1]
            const response = await addCollabToRoleInService(
                item,
                serviceHash,
                roleHash,
                item.collabId,
            )

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: (data, item) => {
            const serviceHash = item.parentId.split('#')[1]
            const roleHash = item.entityId.split('#')[1]
            queryClient.invalidateQueries({
                queryKey: serviceKeys.serviceRoleAssignment(
                    serviceHash,
                    roleHash,
                ),
            })
            toast.push(
                <Notification title={'Servicio asignado'} type="success" />,
            )
            updateUserInList(queryClient, serviceRole?.roleName || '', {
                sk: item.pk,
                status: item.status,
                startedAt:
                    getDayJsDate(
                        dayjs(item.startedAt).toDate(),
                        'DD/MM/YYYY',
                    ) || '',
                endedAt:
                    getDayJsDate(dayjs(item.endedAt).toDate(), 'DD/MM/YYYY') ||
                    '',
            })

            queryClient.invalidateQueries({
                queryKey: serviceKeys.rolesByServiceId(serviceHash),
            })
            onClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    duration={20}
                    title={error.message || 'Error al asignar servicio'}
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (item: TServiceRoleAssignment) => {
            const data: TServiceRoleAssignmentUpdatePayload = {
                startedAt: item.startedAt,
                endedAt: item.endedAt,
                status: item.status,
            }
            const serviceHash = item.parentId.split('#')[1]
            const roleHash = item.entityId.split('#')[1]
            const response = await updateCollabToRoleInService(
                data,
                serviceHash,
                roleHash,
                item.collabId,
            )

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: (data, item) => {
            const serviceHash = item.parentId.split('#')[1]
            const roleHash = item.entityId.split('#')[1]
            queryClient.invalidateQueries({
                queryKey: serviceKeys.updateserviceRoleAssignment(
                    serviceHash,
                    roleHash,
                ),
            })
            toast.push(
                <Notification
                    title="Asignación actualizada correctamente"
                    type="success"
                />,
            )

            updateUserInList(queryClient, serviceRole?.roleName || '', {
                sk: item.pk,
                status: item.status,
                startedAt:
                    getDayJsDate(
                        dayjs(item.startedAt).toDate(),
                        'DD/MM/YYYY',
                    ) || '',
                endedAt:
                    getDayJsDate(dayjs(item.endedAt).toDate(), 'DD/MM/YYYY') ||
                    '',
            })

            queryClient.invalidateQueries({
                queryKey: serviceKeys.rolesByServiceId(serviceHash),
            })
            onClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    duration={20}
                    title={error.message || 'Error al actualizar asignación'}
                    type="danger"
                />,
            )
        },
    })

    const unassignMutation = useMutation({
        mutationFn: async (
            item: Pick<
                TServiceRoleAssignment,
                'pk' | 'parentId' | 'entityId' | 'collabId'
            >,
        ) => {
            const serviceHash = item.parentId.split('#')[1]
            const roleHash = item.entityId.split('#')[1]
            const response = await deleteCollabToRoleInService(
                serviceHash,
                roleHash,
                item.collabId,
            )

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: (data, item) => {
            const serviceHash = item.parentId.split('#')[1]
            const roleHash = item.entityId.split('#')[1]
            queryClient.invalidateQueries({
                queryKey: serviceKeys.deleteServiceRoleAssignment(
                    serviceHash,
                    roleHash,
                    item.collabId,
                ),
            })
            toast.push(
                <Notification
                    title="Asignación actualizada correctamente"
                    type="success"
                />,
            )

            updateUserInList(queryClient, serviceRole?.roleName || '', {
                sk: item.pk,
                status: 'disponible',
                startedAt: undefined,
                endedAt: undefined,
                clearance: undefined,
            })

            queryClient.invalidateQueries({
                queryKey: serviceKeys.rolesByServiceId(serviceHash),
            })
            onClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    duration={20}
                    title={error.message || 'Error al actualizar asignación'}
                    type="danger"
                />,
            )
        },
    })

    const handleSubmit = () => {
        if (!canSubmit || serviceRole === undefined) return

        const item: TServiceRoleAssignment = {
            pk: user!.sk,
            sk: `${serviceRole!.pk}#${serviceRole!.sk}`,
            parentId: serviceRole!.pk,
            entityId: serviceRole!.sk,
            roleName: serviceRole!.roleName,
            collabId: user!.sk.split('#')[1],
            serviceCode: serviceRole!.pk.split('#')[1],
            startedAt: dateRange[0]?.toISOString() || '',
            endedAt: dateRange[1]?.toISOString() || '',
            status,
        }
        assignMutation.mutate(item)
    }

    const handleUpdate = () => {
        if (!canSubmit || serviceRole === undefined) return

        const item: TServiceRoleAssignment = {
            pk: user!.sk,
            sk: `${serviceRole!.pk}#${serviceRole!.sk}`,
            parentId: serviceRole!.pk,
            entityId: serviceRole!.sk,
            roleName: serviceRole!.roleName,
            collabId: user!.sk.split('#')[1],
            serviceCode: serviceRole!.pk.split('#')[1],
            startedAt: dateRange[0]?.toISOString() || '',
            endedAt: dateRange[1]?.toISOString() || '',
            status,
        }
        updateMutation.mutate(item)
    }

    const handleDelete = () => {
        if (!canSubmit || serviceRole === undefined) return

        const item: Pick<
            TServiceRoleAssignment,
            'pk' | 'parentId' | 'entityId' | 'collabId'
        > = {
            pk: user!.sk,
            collabId: user!.sk.split('#')[1],
            parentId: serviceRole!.pk,
            entityId: serviceRole!.sk,
        }
        unassignMutation.mutate(item)
    }

    const handleRangePickerChange = (date: [Date | null, Date | null]) => {
        setDateRange(date as [Date | undefined, Date | undefined])
    }

    return (
        <aside
            className={`
                absolute right-0 top-0 z-20 h-full w-[440px]
                border-l border-gray-200 bg-white shadow-2xl
                transition-transform duration-300
                ${open ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            <div className="flex h-full flex-col">
                <header className="flex items-start justify-between border-b border-gray-100 p-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Asignación
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-gray-900">
                            Proponer o confirmar
                        </h3>
                    </div>
                    <CloseButton
                        disabled={assignMutation.isPending}
                        onClick={onClose}
                    />
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-6">
                        <section className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-sm font-semibold text-gray-900">
                                {userName}
                            </p>

                            {userEmail && (
                                <p className="mt-1 text-xs text-gray-500">
                                    {userEmail}
                                </p>
                            )}
                        </section>

                        <section className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Rango de Fecha
                                </label>
                                <DatePicker.DatePickerRange
                                    placeholder="Selecciona el rango de fechas"
                                    locale="es"
                                    minDate={
                                        serviceRole?.startedAt
                                            ? new Date(serviceRole?.startedAt)
                                            : undefined
                                    }
                                    maxDate={
                                        serviceRole?.endedAt
                                            ? new Date(serviceRole?.endedAt)
                                            : undefined
                                    }
                                    size="sm"
                                    openPickerOnClear
                                    value={
                                        dateRange as [Date | null, Date | null]
                                    }
                                    defaultMonth={
                                        serviceRole?.startedAt
                                            ? new Date(serviceRole?.startedAt)
                                            : undefined
                                    }
                                    onChange={handleRangePickerChange}
                                />
                            </div>
                        </section>

                        <section>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Estado de asignación
                            </label>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStatus('propuesto')}
                                    className={`
                                        rounded-xl border p-4 text-left transition
                                        ${
                                            status === 'propuesto'
                                                ? 'border-yellow-400 bg-yellow-50 ring-4 ring-yellow-400/10'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <p className="text-sm font-semibold text-gray-900">
                                        Propuesto
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Queda sugerido para revisión.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStatus('confirmado')}
                                    className={`
                                        rounded-xl border p-4 text-left transition
                                        ${
                                            status === 'confirmado'
                                                ? 'border-green-500 bg-green-50 ring-4 ring-green-500/10'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <p className="text-sm font-semibold text-gray-900">
                                        Confirmado
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Queda asignado directamente.
                                    </p>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                <footer className="flex items-center justify-end gap-3 border-t border-gray-100 p-6">
                    {user?.status.indexOf('disponible') !== -1 ? (
                        <>
                            <Button
                                disabled={assignMutation.isPending}
                                onClick={onClose}
                                variant="plain"
                            >
                                Cancelar
                            </Button>
                            <Button
                                disabled={
                                    !canSubmit || assignMutation.isPending
                                }
                                onClick={handleSubmit}
                                loading={assignMutation.isPending}
                                variant="solid"
                            >
                                {assignMutation.isPending
                                    ? 'Asignando...'
                                    : 'Asignar Colaborador'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                disabled={
                                    !canSubmit || unassignMutation.isPending
                                }
                                onClick={handleDelete}
                                loading={unassignMutation.isPending}
                                variant="plain"
                                className="text-error  hover:text-error/80"
                            >
                                {unassignMutation.isPending
                                    ? 'Quitando...'
                                    : 'Quitar Asignación'}
                            </Button>
                            <Button
                                disabled={
                                    !canSubmit || updateMutation.isPending
                                }
                                onClick={handleUpdate}
                                loading={updateMutation.isPending}
                                variant="solid"
                            >
                                {updateMutation.isPending
                                    ? 'Actualizando...'
                                    : 'Actualizar'}
                            </Button>
                        </>
                    )}
                </footer>
            </div>
        </aside>
    )
}

export default ServiceDetailsRoleAssignmentDrawer
