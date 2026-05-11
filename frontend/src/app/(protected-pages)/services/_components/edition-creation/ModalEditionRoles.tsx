import {
    Dialog,
    Input,
    FormItem,
    Form,
    DatePicker,
    toast,
    Notification,
    Select,
    Button,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { TServiceRole, TServiceRoleCreatePayload } from '../../types'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateRoleInService } from '@/server/actions/services/update-role-in-service'
import { serviceKeys } from '@/server/actions/services/service-keys'
import { addRoleToService } from '@/server/actions/services/add-role-to-service'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import { listBackOfficeRoles } from '@/server/actions/backoffice/list-roles'
import { useServicesStore } from '../../_store/servicesStore'
import { getDateFromString } from '../../_utils/getDateFromString'
import dayjs from 'dayjs'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { listBackOfficeShifts } from '@/server/actions/backoffice/actions-shifts'
import { TBackOfficeShift } from '@/app/(protected-pages)/backoffice/types'

type ModalEditionRolesProps = {
    roles: TServiceRole[]
    isOpen: boolean
    onClose: () => void
    temporalRole: TServiceRole | null
}

const ModalEditionRoles: React.FC<ModalEditionRolesProps> = ({
    roles,
    isOpen,
    onClose,
    temporalRole,
}) => {
    const { protectedQueryFn } = useProtectedQueryFn()
    const t = useTranslation()
    const queryClient = useQueryClient()
    const service = useServicesStore((state) => state.tempService)
    const [dateRange, setDateRange] = useState<
        [Date | undefined, Date | undefined]
    >([undefined, undefined])

    const { data: backofficeRoles } = useQuery({
        queryKey: backOfficeKeys.roles,
        queryFn: async () => {
            const response = await listBackOfficeRoles(undefined, 500)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
    })

    const { data: shifts, isLoading: isLoadingShifts } = useQuery({
        queryKey: backOfficeKeys.shifts,
        queryFn: async () =>
            protectedQueryFn(() => listBackOfficeShifts(undefined, 500)),
        enabled: isOpen,
    })

    const shiftOptions = useMemo(() => {
        return shifts?.data?.items.map((shift: TBackOfficeShift) => ({
            value: shift.sk,
            label: `${shift.name} - ${shift.type}`,
        }))
    }, [shifts])

    const rolesOptions = useMemo(() => {
        const filtered = backofficeRoles?.items.filter(
            (role) => !roles.find((r) => r.sk === role.sk),
        )
        return filtered?.map((role) => ({
            label: role.name,
            value: role.name,
        }))
    }, [backofficeRoles, roles])

    const isEditing = temporalRole !== null

    const updateMutation = useMutation({
        mutationFn: async (payload: Partial<TServiceRole>) => {
            const response = await updateRoleInService(
                payload,
                service!.sk.split('#')?.[1],
            )
            if (!response.success) throw new Error(response.error)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: serviceKeys.rolesByServiceId(
                    service!.sk.split('#')?.[1],
                ),
            })
            toast.push(
                <Notification
                    title={t('services.roles.messages.updateSuccess')}
                    type="success"
                />,
            )
            handleClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={
                        error.message || t('services.roles.errors.updateFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const createMutation = useMutation({
        mutationFn: async (payload: TServiceRoleCreatePayload) => {
            const response = await addRoleToService(
                payload,
                service!.sk.split('#')[1],
            )
            if (!response.success) throw new Error(response.error)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: serviceKeys.rolesByServiceId(
                    service!.sk.split('#')[1],
                ),
            })
            toast.push(
                <Notification
                    title={t('services.roles.messages.createSuccess')}
                    type="success"
                />,
            )
            handleClose()
        },
        onError: (error: Error) => {
            console.error(error)
            toast.push(
                <Notification
                    title={t('services.roles.errors.createFailed')}
                    type="danger"
                />,
            )
        },
    })

    const onSubmit = async (data: FormValues) => {
        const startedAt = dateRange[0]?.toISOString() || ''
        const endedAt = dateRange[1]?.toISOString() || ''

        const selectedRole = backofficeRoles?.items.find(
            (role) => role.name === data.name,
        )

        const selectedShift = shifts?.data?.items.find(
            (shift) => shift.sk === data.shiftSk,
        )

        if (isEditing && temporalRole) {
            const changedFields: Partial<TServiceRole> = {
                sk: temporalRole.sk,
            }

            if (data.name !== temporalRole.roleName)
                changedFields.roleName = data.name

            if (data.required !== parseInt(temporalRole.required))
                changedFields.required = String(data.required)

            const newStartedAt = dayjs(dateRange[0]).format('YYYY-MM-DD')
            const oldStartedAt = dayjs(temporalRole.startedAt).format(
                'YYYY-MM-DD',
            )

            const newEndedAt = dayjs(dateRange[1]).format('YYYY-MM-DD')
            const oldEndedAt = dayjs(temporalRole.endedAt).format('YYYY-MM-DD')

            if (newStartedAt !== oldStartedAt || newEndedAt !== oldEndedAt) {
                changedFields.startedAt = startedAt
                changedFields.endedAt = endedAt
            }

            if (selectedShift?.sk !== temporalRole.shift.sk)
                changedFields.shift = {
                    sk: selectedShift?.sk || '',
                    weeklyHours: Number(selectedShift?.data.weeklyHours) || 0,
                    hoursPerDay: Number(selectedShift?.data.hoursPerDay) || 0,
                    shiftType: selectedShift?.data.shiftType || '',
                }

            updateMutation.mutate(changedFields)
        } else {
            createMutation.mutate({
                sk: selectedRole?.sk || '',
                roleName: data.name,
                required: String(data.required),
                startedAt,
                endedAt,
                shift: {
                    sk: data.shiftSk,
                    weeklyHours: Number(selectedShift?.data.weeklyHours) || 0,
                    hoursPerDay: Number(selectedShift?.data.hoursPerDay) || 0,
                    shiftType: selectedShift?.data.shiftType || '',
                },
            })
        }
    }

    const getShiftValue = (value: string) => {
        if (!value) return null
        const selectedRole = shifts?.data?.items.find(
            (shift) => shift.sk === value,
        )
        return {
            label: selectedRole?.name,
            value: selectedRole?.sk,
        }
    }

    const isPending = updateMutation.isPending || createMutation.isPending

    const getRoleValue = (value: string) => {
        if (temporalRole) {
            const selectedRole = backofficeRoles?.items.find(
                (role) => role.sk === temporalRole?.sk,
            )

            return {
                label: selectedRole?.name,
                value: selectedRole?.sk,
            }
        }
        if (!value) return null
        const selectedRole = backofficeRoles?.items.find(
            (role) => role.name === value,
        )
        return {
            label: selectedRole?.name,
            value: selectedRole?.sk,
        }
    }

    const validationSchema = z.object({
        name: z.string().min(1, t('common.required')),
        dateRange: z.array(z.date() || null).min(1, t('common.required')),
        required: z.number().min(1, t('common.required')),
        shiftSk: z.string().min(1, 'Turno es requerido'),
    })

    type FormValues = z.infer<typeof validationSchema>

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '',
            dateRange: [
                temporalRole?.startedAt
                    ? getDateFromString(temporalRole.startedAt)
                    : service?.startDate
                      ? getDateFromString(service?.startDate)
                      : undefined,
                temporalRole?.endedAt
                    ? getDateFromString(temporalRole.endedAt)
                    : service?.endDate
                      ? getDateFromString(service?.endDate)
                      : undefined,
            ],
            required: 1,
            shiftSk: '',
        },
    })

    const handleClose = () => {
        reset()
        onClose()
    }

    useEffect(() => {
        if (isEditing && temporalRole) {
            const selectedShift = shifts?.data?.items.find(
                (shift) => shift.sk === temporalRole.shift.sk,
            )

            const dr: [Date | undefined, Date | undefined] = [
                temporalRole.startedAt
                    ? getDateFromString(temporalRole.startedAt)
                    : undefined,
                temporalRole.endedAt
                    ? getDateFromString(temporalRole.endedAt)
                    : undefined,
            ]
            setDateRange(dr)
            reset({
                name: temporalRole.roleName,
                dateRange: dr,
                required: temporalRole.required
                    ? parseInt(temporalRole.required)
                    : 1,
                shiftSk: selectedShift ? selectedShift.sk : '',
            })
        } else {
            const dr: [Date | undefined, Date | undefined] = [
                service?.startDate
                    ? getDateFromString(service?.startDate)
                    : undefined,
                service?.endDate
                    ? getDateFromString(service?.endDate)
                    : undefined,
            ]
            setDateRange(dr)
            reset({
                name: '',
                dateRange: dr,
                required: 1,
                shiftSk: '',
            })
        }
    }, [shifts, temporalRole, isOpen, reset, isEditing, service])

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <Form onSubmit={handleSubmit(onSubmit)}>
                <h5 className="mb-6 font-bold text-lg">
                    {isEditing
                        ? t('services.actions.edit')
                        : t('services.creation.addRoles')}
                </h5>

                <div className="flex flex-col gap-2">
                    <FormItem
                        label={t('services.creation.table.roleName')}
                        invalid={!!errors.name}
                        errorMessage={errors.name?.message}
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={getRoleValue(field.value)}
                                    placeholder={t(
                                        'services.common.roleNamePlaceholder',
                                    )}
                                    options={rolesOptions}
                                    onChange={(opt) =>
                                        field.onChange(opt?.value)
                                    }
                                    isDisabled={isEditing}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('services.common.requiredPeople')}
                        invalid={!!errors.required}
                        errorMessage={errors.required?.message}
                    >
                        <Controller
                            name="required"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="number"
                                    min={1}
                                    onChange={(e) =>
                                        field.onChange(parseInt(e.target.value))
                                    }
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Turno"
                        invalid={!!errors.shiftSk}
                        errorMessage={errors.shiftSk?.message}
                    >
                        <Controller
                            name="shiftSk"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={shiftOptions}
                                    value={getShiftValue(field.value as string)}
                                    onChange={(opt) =>
                                        field.onChange(opt?.value || '')
                                    }
                                    placeholder="Seleccionar turno"
                                    isDisabled={isLoadingShifts}
                                    isLoading={isLoadingShifts}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('services.common.startEndDate')}
                        invalid={!!errors.dateRange}
                        errorMessage="Error al seleccionar las fechas"
                    >
                        <div className="flex items-center gap-2">
                            <Controller
                                name="dateRange"
                                control={control}
                                render={() => (
                                    <DatePicker.DatePickerRange
                                        placeholder="Selecciona el rango de fechas"
                                        minDate={
                                            service?.startDate
                                                ? new Date(service?.startDate)
                                                : undefined
                                        }
                                        maxDate={
                                            service?.endDate
                                                ? new Date(service?.endDate)
                                                : undefined
                                        }
                                        value={
                                            dateRange as [
                                                Date | null,
                                                Date | null,
                                            ]
                                        }
                                        onChange={(date) =>
                                            setDateRange(
                                                date as [
                                                    Date | undefined,
                                                    Date | undefined,
                                                ],
                                            )
                                        }
                                    />
                                )}
                            />
                        </div>
                    </FormItem>
                </div>

                <div className="flex justify-end gap-2 mt-8">
                    <Button
                        variant="plain"
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button variant="solid" type="submit" loading={isPending}>
                        {isEditing ? t('common.save') : t('common.add')}
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default ModalEditionRoles
