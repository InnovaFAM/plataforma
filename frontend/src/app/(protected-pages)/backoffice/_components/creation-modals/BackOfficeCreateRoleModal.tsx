'use client'

import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
import { createRole } from '@/server/actions/backoffice/create-role'
import { updateRole } from '@/server/actions/backoffice/update-role'
import {
    TBackOfficeRoleCreate,
    TBackOfficeRoleUpdate,
    TBackOfficeShift,
} from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import { listBackOfficeShifts } from '@/server/actions/backoffice/actions-shifts'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'

type FormValues = {
    name: string
    shiftSk: string
}

interface BackOfficeCreateRoleModalProps {
    isOpen: boolean
    onClose: () => void
}

const BackOfficeCreateRoleModal = ({
    isOpen,
    onClose,
}: BackOfficeCreateRoleModalProps) => {
    const t = useTranslation()
    const { protectedQueryFn } = useProtectedQueryFn()
    const queryClient = useQueryClient()
    const tempRole = useBackOfficeStore((state) => state.tempRole)
    const setTempRole = useBackOfficeStore((state) => state.setTempRole)

    const isEditing = !!tempRole

    const validationSchema = z.object({
        name: z
            .string()
            .trim()
            .min(1, t('backOffice.roleModal.validation.nameRequired')),
        shiftSk: z.string().min(1, 'Turno es requerido'),
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
            shiftSk: '',
        },
    })

    const { data: shifts, isLoading: isLoadingShifts } = useQuery({
        queryKey: backOfficeKeys.shifts(),
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

    const createMutation = useMutation({
        mutationFn: async (newRole: TBackOfficeRoleCreate) => {
            const response = await createRole(newRole)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.roles(),
            })

            toast.push(
                <Notification
                    title={t('backOffice.roleModal.messages.creationSuccess')}
                    type="success"
                />,
            )

            handleClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={
                        error.message ||
                        t('backOffice.roleModal.errors.creationFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (updatedRole: TBackOfficeRoleUpdate) => {
            const response = await updateRole(updatedRole)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.roles(),
            })

            toast.push(
                <Notification
                    title={t('backOffice.roleModal.messages.updateSuccess')}
                    type="success"
                />,
            )

            handleClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={
                        error.message ||
                        t('backOffice.roleModal.errors.updateFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

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

    const isPending =
        createMutation.isPending || updateMutation.isPending || isLoadingShifts

    useEffect(() => {
        if (tempRole) {
            const selectedShift = shifts?.data?.items.find(
                (shift) =>
                    shift.data.hoursPerDay === tempRole.hoursPerDay &&
                    shift.data.weeklyHours === tempRole.weeklyHours &&
                    shift.data.shiftType === tempRole.shiftType,
            )
            reset({
                name: tempRole.name || '',
                shiftSk: selectedShift ? selectedShift.sk : '',
            })
        } else {
            reset({
                name: '',
                shiftSk: '',
            })
        }
    }, [tempRole, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        const selectedShift = shifts?.data?.items.find(
            (shift: TBackOfficeShift) => shift.sk === data.shiftSk,
        )

        if (!selectedShift) {
            toast.push(
                <Notification
                    title="Debe seleccionar un turno"
                    type="danger"
                />,
            )
            return
        }

        if (isEditing && tempRole) {
            const changeFields: TBackOfficeRoleUpdate = {
                sk: tempRole.sk,
            }
            if (tempRole.name !== data.name)
                changeFields.name = data.name.trim()
            if (tempRole.hoursPerDay !== selectedShift.data.hoursPerDay)
                changeFields.hoursPerDay = Number(
                    selectedShift.data.hoursPerDay,
                )
            if (tempRole.weeklyHours !== selectedShift.data.weeklyHours)
                changeFields.weeklyHours = Number(
                    selectedShift.data.weeklyHours,
                )
            if (tempRole.shiftType !== selectedShift.data.shiftType)
                changeFields.shiftType = selectedShift.data.shiftType

            updateMutation.mutate(changeFields)
            return
        }

        const payload: TBackOfficeRoleCreate = {
            name: data.name.trim(),
            hoursPerDay: selectedShift.data.hoursPerDay,
            weeklyHours: selectedShift.data.weeklyHours,
            shiftType: selectedShift.name,
        }

        createMutation.mutate(payload)
    }

    const handleClose = () => {
        setTempRole(null)
        reset({
            name: '',
            shiftSk: '',
        })
        onClose()
    }

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
                        {isEditing
                            ? t('backOffice.roleModal.titleEdit')
                            : t('backOffice.roleModal.titleCreate')}
                    </h3>

                    <div className="flex flex-col gap-4">
                        <FormItem
                            label={t('backOffice.roleModal.fields.name')}
                            invalid={!!errors.name}
                            errorMessage={errors.name?.message}
                        >
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder={t(
                                            'backOffice.roleModal.fields.namePlaceholder',
                                        )}
                                        disabled={isPending}
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
                                        value={getShiftValue(field.value)}
                                        onChange={(opt) =>
                                            field.onChange(opt?.value || '')
                                        }
                                        placeholder="Seleccionar turno"
                                        isDisabled={isPending}
                                        isLoading={isLoadingShifts}
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
                        loading={
                            createMutation.isPending || updateMutation.isPending
                        }
                        disabled={isPending}
                    >
                        {t('common.save')}
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default BackOfficeCreateRoleModal
