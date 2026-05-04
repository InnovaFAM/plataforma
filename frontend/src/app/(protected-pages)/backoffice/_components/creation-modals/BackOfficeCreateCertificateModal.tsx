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
import { createCertificate } from '@/server/actions/backoffice/create-certificate'
import { updateCertificate } from '@/server/actions/backoffice/update-certificate'
import {
    TRelevance,
    TBackOfficeCertificateCreate,
    TBackOfficeCertificateUpdate,
    TMatrix,
} from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'

type FormValues = {
    name: string
    code: string
    type: string
    relevance: string
    matrix: string
}

interface BackOfficeCreateCertificateModalProps {
    isOpen: boolean
    onClose: () => void
}

const BackOfficeCreateCertificateModal = ({
    isOpen,
    onClose,
}: BackOfficeCreateCertificateModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()

    const tempCertification = useBackOfficeStore(
        (state) => state.tempCertification,
    )
    const setTempCertification = useBackOfficeStore(
        (state) => state.setTempCertification,
    )

    const isEditing = !!tempCertification

    const validationSchema = z.object({
        name: z
            .string()
            .min(1, t('backOffice.certificateModal.validation.nameRequired')),
        code: z
            .string()
            .min(1, t('backOffice.certificateModal.validation.codeRequired')),
        type: z
            .string()
            .min(1, t('backOffice.certificateModal.validation.typeRequired')),
        relevance: z.string().min(1),
        matrix: z
            .string()
            .min(1, t('backOffice.certificateModal.validation.matrixRequired')),
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
            type: '',
            relevance: '-1',
            matrix: '',
        },
    })

    const createMutation = useMutation({
        mutationFn: async (newCertificate: TBackOfficeCertificateCreate) => {
            const response = await createCertificate(newCertificate)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.certifications(),
            })
            toast.push(
                <Notification
                    title={t(
                        'backOffice.certificateModal.messages.creationSuccess',
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
                        t('backOffice.certificateModal.errors.creationFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (
            updatedCertificate: TBackOfficeCertificateUpdate,
        ) => {
            const response = await updateCertificate(updatedCertificate)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: backOfficeKeys.certifications(),
            })
            toast.push(
                <Notification
                    title={t(
                        'backOffice.certificateModal.messages.updateSuccess',
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
                        t('backOffice.certificateModal.errors.updateFailed')
                    }
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (tempCertification) {
            reset({
                name: tempCertification.name || '',
                code: tempCertification.code || '',
                type: tempCertification.type || '',
                relevance: tempCertification.relevance || '-1',
                matrix: tempCertification.matrix || '',
            })
        } else {
            reset({
                name: '',
                code: '',
                type: '',
                relevance: '-1',
                matrix: '',
            })
        }
    }, [tempCertification, reset, isOpen])

    const onSubmit = (data: FormValues) => {
        const matrix = data.matrix as TMatrix
        const relevance = data.relevance as TRelevance

        if (isEditing && tempCertification) {
            const payload: TBackOfficeCertificateUpdate = {
                sk: tempCertification.sk,
                name: data.name,
                code: data.code,
                type: data.type,
                relevance,
                matrix,
            }
            updateMutation.mutate(payload)
        } else {
            const payload: TBackOfficeCertificateCreate = {
                name: data.name,
                code: data.code,
                type: data.type,
                relevance,
                matrix,
            }
            createMutation.mutate(payload)
        }
    }

    const handleClose = () => {
        setTempCertification(null)
        reset()
        onClose()
    }

    const matrixOptions = [
        {
            value: 'Cargo',
            label: t('backOffice.certificateModal.fields.matrixOptions.cargo'),
        },
        {
            value: 'Faena',
            label: t('backOffice.certificateModal.fields.matrixOptions.faena'),
        },
        {
            value: 'Global',
            label: t('backOffice.certificateModal.fields.matrixOptions.global'),
        },
    ]

    const relevanceOptions = [
        {
            value: '-1',
            label: t(
                'backOffice.certificateModal.fields.relevanceOptions.none',
            ),
        },
        {
            value: '30',
            label: t('backOffice.certificateModal.fields.relevanceOptions.30'),
        },
        {
            value: '60',
            label: t('backOffice.certificateModal.fields.relevanceOptions.60'),
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
                        {isEditing
                            ? t('backOffice.certificateModal.titleEdit')
                            : t('backOffice.certificateModal.titleCreate')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem
                            label={t('backOffice.certificateModal.fields.name')}
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
                                            'backOffice.certificateModal.fields.namePlaceholder',
                                        )}
                                        disabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('backOffice.certificateModal.fields.code')}
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
                                            'backOffice.certificateModal.fields.codePlaceholder',
                                        )}
                                        disabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('backOffice.certificateModal.fields.type')}
                            invalid={!!errors.type}
                            errorMessage={errors.type?.message}
                        >
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder={t(
                                            'backOffice.certificateModal.fields.typePlaceholder',
                                        )}
                                        disabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label={t(
                                'backOffice.certificateModal.fields.relevance',
                            )}
                            invalid={!!errors.relevance}
                            errorMessage={errors.relevance?.message}
                        >
                            <Controller
                                name="relevance"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={relevanceOptions}
                                        value={relevanceOptions.find(
                                            (opt) => opt.value === field.value,
                                        )}
                                        onChange={(opt) =>
                                            field.onChange(opt?.value)
                                        }
                                        isDisabled={isPending}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label={t(
                                'backOffice.certificateModal.fields.matrix',
                            )}
                            invalid={!!errors.matrix}
                            errorMessage={errors.matrix?.message}
                        >
                            <Controller
                                name="matrix"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={matrixOptions}
                                        value={matrixOptions.find(
                                            (opt) => opt.value === field.value,
                                        )}
                                        onChange={(opt) =>
                                            field.onChange(opt?.value)
                                        }
                                        isDisabled={isPending}
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

export default BackOfficeCreateCertificateModal
