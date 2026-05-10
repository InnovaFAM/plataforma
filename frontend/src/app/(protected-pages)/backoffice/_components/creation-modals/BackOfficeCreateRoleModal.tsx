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
import { createRole } from '@/server/actions/backoffice/create-role'
import { updateRole } from '@/server/actions/backoffice/update-role'
import { TBackOfficeRoleCreate, TBackOfficeRoleUpdate } from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'

type FormValues = {
    name: string
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
    const queryClient = useQueryClient()
    const tempRole = useBackOfficeStore((state) => state.tempRole)
    const setTempRole = useBackOfficeStore((state) => state.setTempRole)

    const isEditing = !!tempRole

    const validationSchema = z.object({
        name: z
            .string()
            .trim()
            .min(1, t('backOffice.roleModal.validation.nameRequired')),
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
        },
    })

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
                queryKey: backOfficeKeys.roles,
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
                queryKey: backOfficeKeys.roles,
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

    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (tempRole) {
            reset({
                name: tempRole.name || '',
            })
        } else {
            reset({
                name: '',
            })
        }
    }, [tempRole, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        if (isEditing && tempRole) {
            if (tempRole.name === data.name) {
                toast.push(
                    <Notification title="Actualizar Cargo" type="warning">
                        Sin cambios que actualizar
                    </Notification>,
                )
            }

            updateMutation.mutate({
                sk: tempRole.sk,
                name: data.name.trim(),
            })
            return
        }

        const payload: TBackOfficeRoleCreate = {
            name: data.name.trim(),
        }

        createMutation.mutate(payload)
    }

    const handleClose = () => {
        setTempRole(null)
        reset({
            name: '',
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
