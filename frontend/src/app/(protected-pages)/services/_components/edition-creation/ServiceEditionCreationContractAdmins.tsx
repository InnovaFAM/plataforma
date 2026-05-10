'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TContractManager, TDetailedService } from '../../types'
import ServiceDetailsContractAdmins from '../service-details/ServiceDetailsContractAdmins'
import {
    Button,
    Dialog,
    Input,
    Select,
    FormItem,
    Form,
    toast,
    Notification,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import getContractAdminTypeText from '../../_utils/getContractAdminTypeText'
import PhoneNumberInput from '@/components/shared/PhoneInput'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateService } from '@/server/actions/services/update-service'
import { serviceKeys } from '@/server/actions/services/service-keys'

interface ServiceEditionCreationContractAdminsProps {
    service?: TDetailedService | null
    onValueChange?: (
        prop: keyof TDetailedService,
        value: TDetailedService[keyof TDetailedService],
    ) => void
    isDetailsView?: boolean
    isLoading?: boolean
}

const ServiceEditionCreationContractAdmins = ({
    service,
    onValueChange,
    isDetailsView = false,
    isLoading = false,
}: ServiceEditionCreationContractAdminsProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const [editingAdmin, setEditingAdmin] = useState<TContractManager | null>(
        null,
    )

    const validationSchema = z.object({
        name: z
            .string()
            .min(
                1,
                t(
                    'services.creation.contractAdminModal.validation.nameRequired',
                ),
            ),
        email: z
            .email(
                t(
                    'services.creation.contractAdminModal.validation.emailInvalid',
                ),
            )
            .min(
                1,
                t(
                    'services.creation.contractAdminModal.validation.emailRequired',
                ),
            ),
        role: z
            .string()
            .min(
                1,
                t(
                    'services.creation.contractAdminModal.validation.roleRequired',
                ),
            ),
        phoneNumber: z.string().optional(),
        type: z.enum(['cliente', 'fam']),
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
            email: '',
            role: '',
            phoneNumber: '',
            type: 'cliente',
        },
    })

    const typeOptions = [
        { value: 'cliente', label: getContractAdminTypeText('cliente', t) },
        { value: 'fam', label: getContractAdminTypeText('fam', t) },
    ]

    useEffect(() => {
        if (editingAdmin) {
            reset(editingAdmin)
        } else {
            reset({
                name: '',
                email: '',
                role: '',
                phoneNumber: '',
                type: 'cliente',
            })
        }
    }, [editingAdmin, reset])

    const handleClose = () => {
        setEditingAdmin(null)
        reset()
        setOpen(false)
    }

    const updateServiceMutation = useMutation({
        mutationFn: async (data: Partial<TDetailedService>) => {
            if (!data.sk) throw new Error('Missing sk')

            const response = await updateService(data)
            if (!response.success) throw new Error(response.error)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: serviceKeys.serviceById(
                    service?.sk?.split('#')?.[1] || '',
                ),
            })
            toast.push(
                <Notification
                    title={t('services.messages.adminAddSuccess')}
                    type="success"
                />,
            )
        },
        onError: (error: Error) => {
            console.error(error)
            toast.push(
                <Notification
                    title={error.message || t('services.errors.adminAddError')}
                    type="danger"
                />,
            )
        },
    })

    const onSubmit = (data: FormValues) => {
        const currentAdmins = service?.managers || []
        let updatedAdmins: TContractManager[]

        if (editingAdmin) {
            updatedAdmins = currentAdmins.map((admin) =>
                admin.email === editingAdmin.email
                    ? (data as TContractManager)
                    : admin,
            )
        } else {
            updatedAdmins = [...currentAdmins, data as TContractManager]
        }

        if (isDetailsView) {
            updateServiceMutation.mutate({
                sk: service?.sk,
                managers: updatedAdmins,
            })
        } else {
            onValueChange?.('managers', updatedAdmins)
        }

        handleClose()
    }

    return (
        <>
            <ServiceDetailsContractAdmins
                admins={service?.managers || []}
                isLoading={isLoading || updateServiceMutation.isPending}
                onEdit={(admin) => {
                    setEditingAdmin(admin)
                    setOpen(true)
                }}
                onAddAdmin={() => {
                    setEditingAdmin(null)
                    setOpen(true)
                }}
                onRemove={(admin) => {
                    const updatedAdmins = (service?.managers || []).filter(
                        (a) => a.email !== admin.email,
                    )
                    onValueChange?.('managers', updatedAdmins)
                }}
            />

            <Dialog
                isOpen={open}
                onClose={handleClose}
                onRequestClose={handleClose}
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <h2 className="text-lg font-bold mb-6">
                        {editingAdmin
                            ? t('services.creation.editContractAdmin')
                            : t('services.creation.addContractAdmin')}
                    </h2>

                    <div className="flex flex-col">
                        <FormItem
                            label={t(
                                'services.creation.contractAdminModal.nameLabel',
                            )}
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
                                            'services.creation.contractAdminModal.namePlaceholder',
                                        )}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t(
                                'services.creation.contractAdminModal.emailLabel',
                            )}
                            invalid={!!errors.email}
                            errorMessage={errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder={t(
                                            'services.creation.contractAdminModal.emailPlaceholder',
                                        )}
                                    />
                                )}
                            />
                        </FormItem>

                        <PhoneNumberInput
                            name="phoneNumber"
                            control={control}
                            errors={errors}
                            label={t(
                                'services.creation.contractAdminModal.phoneLabel',
                            )}
                        />

                        <div className="flex gap-4">
                            <FormItem
                                label={t(
                                    'services.creation.contractAdminModal.roleLabel',
                                )}
                                invalid={!!errors.role}
                                errorMessage={errors.role?.message}
                                className="flex-[2]"
                            >
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder={t(
                                                'services.creation.contractAdminModal.rolePlaceholder',
                                            )}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label={t(
                                    'services.creation.contractAdminModal.typeLabel',
                                )}
                                invalid={!!errors.type}
                                errorMessage={errors.type?.message}
                                className="flex-1"
                            >
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={typeOptions}
                                            value={typeOptions.find(
                                                (opt) =>
                                                    opt.value === field.value,
                                            )}
                                            onChange={(opt) =>
                                                field.onChange(opt?.value)
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-8">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={handleClose}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit">
                            {editingAdmin ? t('common.save') : t('common.add')}
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default ServiceEditionCreationContractAdmins
