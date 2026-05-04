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
    toast,
    Notification,
    DatePicker,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'

import { useBackOfficeStore } from '../../_store/backOfficeStore'
import { createHoliday } from '@/server/actions/backoffice/create-holiday'
import { updateHoliday } from '@/server/actions/backoffice/update-holiday'
import { TBackOfficeHolidayCreate, TBackOfficeHolidayUpdate } from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import dayjs from 'dayjs'

type FormValues = {
    date: string
    type: string
}

interface BackOfficeCreateHolidayModalProps {
    isOpen: boolean
    onClose: () => void
}

const BackOfficeCreateHolidayModal = ({
    isOpen,
    onClose,
}: BackOfficeCreateHolidayModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()

    const tempHoliday = useBackOfficeStore((state) => state.tempHoliday)
    const setTempHoliday = useBackOfficeStore((state) => state.setTempHoliday)

    const isEditing = !!tempHoliday

    const validationSchema = z.object({
        date: z
            .string()
            .min(1, t('backOffice.holidayModal.validation.dateRequired')),
        type: z
            .string()
            .min(1, t('backOffice.holidayModal.validation.typeRequired'))
            .refine(
                (val): val is 'auto' | 'manual' =>
                    ['auto', 'manual'].includes(val),
                t('backOffice.holidayModal.validation.typeRequired'),
            ),
    })

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            date: '',
            type: 'manual',
        },
    })

    const createMutation = useMutation({
        mutationFn: async (newHoliday: TBackOfficeHolidayCreate) => {
            const response = await createHoliday(newHoliday)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: backOfficeKeys.holidays(),
            })
            toast.push(
                <Notification
                    title={t(
                        'backOffice.holidayModal.messages.creationSuccess',
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
                        t('backOffice.holidayModal.errors.creationFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (updatedHoliday: TBackOfficeHolidayUpdate) => {
            const response = await updateHoliday(updatedHoliday)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: backOfficeKeys.holidays(),
            })
            toast.push(
                <Notification
                    title={t('backOffice.holidayModal.messages.updateSuccess')}
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
                        t('backOffice.holidayModal.errors.updateFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (tempHoliday) {
            reset({
                date: tempHoliday.date || '',
                type: tempHoliday.type || 'manual',
            })
        } else {
            reset({
                date: '',
                type: 'manual',
            })
        }
    }, [tempHoliday, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        const type = data.type as 'auto' | 'manual'
        if (isEditing && tempHoliday) {
            const payload: TBackOfficeHolidayUpdate = {
                sk: tempHoliday.sk,
                date: data.date,
                type: 'manual',
            }
            updateMutation.mutate(payload)
        } else {
            const payload: TBackOfficeHolidayCreate = {
                date: data.date,
                type,
            }
            createMutation.mutate(payload)
        }
    }

    const handleClose = () => {
        setTempHoliday(null)
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
                            ? t('backOffice.holidayModal.titleEdit')
                            : t('backOffice.holidayModal.titleCreate')}
                    </h3>

                    <FormItem
                        label={t('backOffice.holidayModal.fields.date')}
                        invalid={!!errors.date}
                        errorMessage={errors.date?.message}
                    >
                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    value={
                                        field.value
                                            ? dayjs(field.value).toDate()
                                            : null
                                    }
                                    onChange={(date) =>
                                        field.onChange(
                                            date
                                                ? dayjs(date).format(
                                                      'YYYY-MM-DD',
                                                  )
                                                : '',
                                        )
                                    }
                                    placeholder={t(
                                        'backOffice.holidayModal.fields.datePlaceholder',
                                    )}
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

export default BackOfficeCreateHolidayModal
