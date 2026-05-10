'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRut, formatRut, checkRut } from 'react-rut-formatter'

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
import { createClient } from '@/server/actions/backoffice/create-client'
import { updateClient } from '@/server/actions/backoffice/update-client'
import { TBackOfficeClientCreate, TBackOfficeClientUpdate } from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import { translateError } from '../../_utils/errorTranslations'

type FormValues = {
    name: string
    rut: string
}

interface BackOfficeCreateClientModalProps {
    isOpen: boolean
    onClose: () => void
}

const BackOfficeCreateClientModal = ({
    isOpen,
    onClose,
}: BackOfficeCreateClientModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()
    const { rut, updateRut, isValid } = useRut()

    const tempClient = useBackOfficeStore((state) => state.tempClient)
    const setTempClient = useBackOfficeStore((state) => state.setTempClient)

    const isEditing = !!tempClient

    const validationSchema = z.object({
        name: z
            .string()
            .min(1, t('backOffice.clientModal.validation.nameRequired')),
        rut: z
            .string()
            .min(1, t('backOffice.clientModal.validation.rutRequired'))
            .refine((val) => checkRut(val), {
                message: t('backOffice.clientModal.validation.rutInvalid'),
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
            rut: '',
        },
    })

    const createMutation = useMutation({
        mutationFn: async (newClient: TBackOfficeClientCreate) => {
            const response = await createClient(newClient)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.clients,
            })
            toast.push(
                <Notification
                    title={t('backOffice.clientModal.messages.creationSuccess')}
                    type="success"
                />,
            )
            handleClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={
                        error.message
                            ? translateError(error.message, t)
                            : t('backOffice.clientModal.errors.creationFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (updatedClient: TBackOfficeClientUpdate) => {
            const response = await updateClient(updatedClient)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.clients,
            })
            toast.push(
                <Notification
                    title={t('backOffice.clientModal.messages.updateSuccess')}
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
                        t('backOffice.clientModal.errors.updateFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (tempClient) {
            updateRut(tempClient.rut || '')
            reset({
                name: tempClient.name || '',
                rut: tempClient.rut || '',
            })
        } else {
            updateRut('')
            reset({ name: '', rut: '' })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempClient, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        if (isEditing && tempClient) {
            const payload: TBackOfficeClientUpdate = {
                sk: tempClient.sk,
                name: data.name,
            }
            updateMutation.mutate(payload)
        } else {
            const payload: TBackOfficeClientCreate = {
                name: data.name,
                rut: data.rut,
            }
            createMutation.mutate(payload)
        }
    }

    const handleClose = () => {
        setTempClient(null)
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
                            ? t('backOffice.clientModal.titleEdit')
                            : t('backOffice.clientModal.titleCreate')}
                    </h3>

                    <FormItem
                        label={t('backOffice.clientModal.fields.name')}
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
                                        'backOffice.clientModal.fields.namePlaceholder',
                                    )}
                                    disabled={isPending}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('backOffice.clientModal.fields.rut')}
                        invalid={
                            !!errors.rut || (rut.raw.length > 0 && !isValid)
                        }
                        errorMessage={
                            errors.rut?.message ||
                            (rut.raw.length > 0 && !isValid
                                ? t(
                                      'backOffice.clientModal.validation.rutInvalid',
                                  )
                                : undefined)
                        }
                    >
                        <Controller
                            name="rut"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={rut.formatted}
                                    onChange={(e) => {
                                        updateRut(e.target.value)
                                        field.onChange(
                                            formatRut(e.target.value),
                                        )
                                    }}
                                    onBlur={field.onBlur}
                                    placeholder={t(
                                        'backOffice.clientModal.fields.rutPlaceholder',
                                    )}
                                    disabled={isPending || isEditing}
                                    title={
                                        isEditing
                                            ? t(
                                                  'backOffice.clientModal.fields.rutDisabledHint',
                                              )
                                            : ''
                                    }
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

export default BackOfficeCreateClientModal
