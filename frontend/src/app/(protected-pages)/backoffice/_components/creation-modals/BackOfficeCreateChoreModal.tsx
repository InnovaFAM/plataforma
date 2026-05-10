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
import { createChore } from '@/server/actions/backoffice/create-chore'
import { updateChore } from '@/server/actions/backoffice/update-chore'
import { TBackOfficeChoreCreate, TBackOfficeChoreUpdate } from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'

type FormValues = {
    name: string
    code: string
}

interface BackOfficeCreateChoreModalProps {
    isOpen: boolean
    onClose: () => void
}

const BackOfficeCreateChoreModal = ({
    isOpen,
    onClose,
}: BackOfficeCreateChoreModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()

    const tempChore = useBackOfficeStore((state) => state.tempChore)
    const setTempChore = useBackOfficeStore((state) => state.setTempChore)

    const isEditing = !!tempChore

    const validationSchema = z.object({
        name: z
            .string()
            .min(1, t('backOffice.choreModal.validation.nameRequired')),
        code: z
            .string()
            .min(1, t('backOffice.choreModal.validation.codeRequired')),
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
            code: '',
        },
    })

    const createMutation = useMutation({
        mutationFn: async (newChore: TBackOfficeChoreCreate) => {
            const response = await createChore(newChore)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.chores,
            })
            toast.push(
                <Notification
                    title={t('backOffice.choreModal.messages.creationSuccess')}
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
                        t('backOffice.choreModal.errors.creationFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (updatedChore: TBackOfficeChoreUpdate) => {
            const response = await updateChore(updatedChore)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.chores,
            })
            toast.push(
                <Notification
                    title={t('backOffice.choreModal.messages.updateSuccess')}
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
                        t('backOffice.choreModal.errors.updateFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (tempChore) {
            reset({
                name: tempChore.name || '',
                code: tempChore.code || '',
            })
        } else {
            reset({
                name: '',
                code: '',
            })
        }
    }, [tempChore, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        if (isEditing && tempChore) {
            const payload: TBackOfficeChoreUpdate = {
                sk: tempChore.sk,
                name: data.name,
                code: data.code,
            }
            updateMutation.mutate(payload)
        } else {
            const payload: TBackOfficeChoreCreate = {
                name: data.name,
                code: data.code,
            }
            createMutation.mutate(payload)
        }
    }

    const handleClose = () => {
        setTempChore(null)
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
                            ? t('backOffice.choreModal.titleEdit')
                            : t('backOffice.choreModal.titleCreate')}
                    </h3>

                    <FormItem
                        label={t('backOffice.choreModal.fields.name')}
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
                                        'backOffice.choreModal.fields.namePlaceholder',
                                    )}
                                    disabled={isPending}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('backOffice.choreModal.fields.code')}
                        invalid={!!errors.code}
                        errorMessage={errors.code?.message}
                    >
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder={t(
                                        'backOffice.choreModal.fields.codePlaceholder',
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

export default BackOfficeCreateChoreModal
