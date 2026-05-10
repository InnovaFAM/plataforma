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
    toast,
    Notification,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'

import { useBackOfficeStore } from '../../_store/backOfficeStore'
import { createDivision } from '@/server/actions/backoffice/create-division'
import { updateDivision } from '@/server/actions/backoffice/update-division'
import {
    TBackOfficeDivisionCreate,
    TBackOfficeDivisionUpdate,
} from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'

type FormValues = {
    name: string
    number: string
}

interface BackOfficeCreateDivisionModalProps {
    isOpen: boolean
    onClose: () => void
}

const BackOfficeCreateDivisionModal = ({
    isOpen,
    onClose,
}: BackOfficeCreateDivisionModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()

    const tempDivision = useBackOfficeStore((state) => state.tempDivision)
    const setTempDivision = useBackOfficeStore((state) => state.setTempDivision)

    const isEditing = !!tempDivision

    const validationSchema = z.object({
        name: z
            .string()
            .min(1, t('backOffice.divisionModal.validation.nameRequired')),
        number: z
            .string()
            .min(1, t('backOffice.divisionModal.validation.numberRequired')),
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
            number: '',
        },
    })

    const createMutation = useMutation({
        mutationFn: async (newDivision: TBackOfficeDivisionCreate) => {
            const response = await createDivision(newDivision)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.divisions,
            })
            toast.push(
                <Notification
                    title={t(
                        'backOffice.divisionModal.messages.creationSuccess',
                    )}
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
                        t('backOffice.divisionModal.errors.creationFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (updatedDivision: TBackOfficeDivisionUpdate) => {
            const response = await updateDivision(updatedDivision)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.divisions,
            })
            toast.push(
                <Notification
                    title={t('backOffice.divisionModal.messages.updateSuccess')}
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
                        t('backOffice.divisionModal.errors.updateFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (tempDivision) {
            reset({
                name: tempDivision.name || '',
                number: tempDivision.number || '',
            })
        } else {
            reset({
                name: '',
                number: '',
            })
        }
    }, [tempDivision, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        if (isEditing && tempDivision) {
            const payload: TBackOfficeDivisionUpdate = {
                sk: tempDivision.sk,
                name: data.name,
                number: data.number,
            }
            updateMutation.mutate(payload)
        } else {
            const payload: TBackOfficeDivisionCreate = {
                name: data.name,
                number: data.number,
            }
            createMutation.mutate(payload)
        }
    }

    const handleClose = () => {
        setTempDivision(null)
        reset()
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
                            ? t('backOffice.divisionModal.titleEdit')
                            : t('backOffice.divisionModal.titleCreate')}
                    </h3>

                    <FormItem
                        label={t('backOffice.divisionModal.fields.name')}
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
                                        'backOffice.divisionModal.fields.namePlaceholder',
                                    )}
                                    disabled={isPending}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('backOffice.divisionModal.fields.number')}
                        invalid={!!errors.number}
                        errorMessage={errors.number?.message}
                    >
                        <Controller
                            name="number"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder={t(
                                        'backOffice.divisionModal.fields.numberPlaceholder',
                                    )}
                                    disabled={isPending}
                                />
                            )}
                        />
                    </FormItem>
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

export default BackOfficeCreateDivisionModal
