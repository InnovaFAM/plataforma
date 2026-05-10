'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
    Dialog,
    Form,
    FormItem,
    Button,
    Input,
    Select,
    toast,
    Notification,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'

import { useBackOfficeStore } from '../../_store/backOfficeStore'
import { TBackOfficeShiftCreate, TBackOfficeShiftUpdate } from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import {
    createShift,
    updateShift,
} from '@/server/actions/backoffice/actions-shifts'

enum ShiftType {
    Día = 'Día',
    Noche = 'Noche',
}

type FormValues = {
    name: string
    distribution: string
    type: ShiftType
    data: {
        hoursPerDay: number | 0
        weeklyHours: number | 0
    }
}

interface BackOfficeCreateShiftModalProps {
    isOpen: boolean
    onClose: () => void
}

const BackOfficeCreateShiftModal = ({
    isOpen,
    onClose,
}: BackOfficeCreateShiftModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()

    const tempShift = useBackOfficeStore((state) => state.tempShift)
    const setTempShift = useBackOfficeStore((state) => state.setTempShift)

    const isEditing = !!tempShift

    const validationSchema = z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Nombre es requerido')
            .max(30, 'Nombre no puede superar los 30 caracteres'),
        distribution: z
            .string()
            .trim()
            .min(1, 'Distribución es requerida')
            .max(120, 'Distribución no puede superar los 120 caracteres'),
        type: z.enum(ShiftType).refine((value) => ShiftType[value], {
            message: 'Tipo inválido',
        }),
        data: z.object({
            hoursPerDay: z
                .number('Horas por día es requerido')
                .positive('Horas por día debe ser mayor a 0')
                .max(24, 'Horas por día no puede superar 24'),
            weeklyHours: z
                .number('Horas semanales es requerido')
                .positive('Horas semanales debe ser mayor a 0')
                .max(42, 'Horas semanales no puede superar 42'),
        }),
    })

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '',
            distribution: '',
            type: ShiftType.Día,
            data: {
                hoursPerDay: 0,
                weeklyHours: 0,
            },
        },
    })

    const createMutation = useMutation({
        mutationFn: async (newShift: TBackOfficeShiftCreate) => {
            const response = await createShift(newShift)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.shifts,
            })

            toast.push(
                <Notification
                    title="Turno creado correctamente"
                    type="success"
                />,
            )

            handleClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={error.message || 'No se pudo crear el turno'}
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (updatedShift: TBackOfficeShiftUpdate) => {
            const response = await updateShift(updatedShift)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.shifts,
            })

            toast.push(
                <Notification
                    title="Turno actualizado correctamente"
                    type="success"
                />,
            )

            handleClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={error.message || 'No se pudo actualizar el turno'}
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (tempShift) {
            reset({
                name: tempShift.name || '',
                distribution: tempShift.distribution || '',
                type: tempShift.type == 'Día' ? ShiftType.Día : ShiftType.Noche,
                data: {
                    hoursPerDay: tempShift.data?.hoursPerDay || 0,
                    weeklyHours: tempShift.data?.weeklyHours || 0,
                },
            })
        } else {
            reset({
                name: '',
                distribution: '',
                type: ShiftType.Día,
                data: {
                    hoursPerDay: 0,
                    weeklyHours: 0,
                },
            })
        }
    }, [tempShift, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        const payload = {
            name: data.name.trim(),
            distribution: data.distribution.trim(),
            type: ShiftType[data.type],
            data: {
                hoursPerDay: Number(data.data.hoursPerDay),
                weeklyHours: Number(data.data.weeklyHours),
            },
        }

        if (isEditing && tempShift) {
            const updatedPayload: TBackOfficeShiftUpdate = {
                sk: tempShift.sk,
                ...payload,
            }

            updateMutation.mutate(updatedPayload)
            return
        }

        const createPayload: TBackOfficeShiftCreate = payload

        createMutation.mutate(createPayload)
    }

    const handleClose = () => {
        setTempShift(null)
        reset({
            name: '',
            distribution: '',
            type: ShiftType.Día,
            data: {
                hoursPerDay: 0,
                weeklyHours: 0,
            },
        })
        onClose()
    }

    const typeOptions = [
        {
            value: 'Día',
            label: 'Día',
        },
        {
            value: 'Noche',
            label: 'Noche',
        },
    ]

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            closable={false}
            shouldCloseOnEsc={!isPending}
            shouldCloseOnOverlayClick={!isPending}
            onRequestClose={handleClose}
        >
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold mb-2">
                        {isEditing ? 'Editar turno' : 'Crear turno'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem
                            label="Nombre"
                            invalid={!!errors.name}
                            errorMessage={errors.name?.message}
                        >
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Ej: 7x7 Día"
                                        maxLength={30}
                                        disabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="Tipo"
                            invalid={!!errors.type}
                            errorMessage={errors.type?.message}
                        >
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={typeOptions}
                                        value={typeOptions.find(
                                            (opt) => opt.value === field.value,
                                        )}
                                        onChange={(opt) =>
                                            field.onChange(opt?.value || '')
                                        }
                                        isDisabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="Distribución"
                            invalid={!!errors.distribution}
                            errorMessage={errors.distribution?.message}
                            className="md:col-span-2"
                        >
                            <Controller
                                name="distribution"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="Ej: 7 días trabajados / 7 días libres"
                                        maxLength={120}
                                        disabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="Horas por día"
                            invalid={!!errors.data?.hoursPerDay}
                            errorMessage={errors.data?.hoursPerDay?.message}
                        >
                            <Controller
                                name="data.hoursPerDay"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        min={1}
                                        max={24}
                                        step="0.5"
                                        placeholder="Ej: 8"
                                        disabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="Horas semanales"
                            invalid={!!errors.data?.weeklyHours}
                            errorMessage={errors.data?.weeklyHours?.message}
                        >
                            <Controller
                                name="data.weeklyHours"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        min={1}
                                        max={40}
                                        step="0.5"
                                        placeholder="Ej: 40"
                                        disabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        {t('common.cancel')}
                    </Button>

                    <Button
                        type="submit"
                        variant="solid"
                        loading={isPending}
                        disabled={isPending}
                    >
                        {t('common.save')}
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default BackOfficeCreateShiftModal
