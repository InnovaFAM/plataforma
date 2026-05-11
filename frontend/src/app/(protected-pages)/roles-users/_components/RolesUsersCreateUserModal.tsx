'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    toast,
    Notification,
    Dialog,
    Form,
    FormItem,
    Button,
    Input,
    Select,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TSystemRole, TUser } from '../types'
import { useRolesUsersStore } from '../_store/rolesUsersStore'
import PhoneNumberInput from '@/components/shared/PhoneInput'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '@/server/actions/users/create-user'
import { usersKeys } from '@/server/actions/users/users-keys'

interface RolesUsersCreateUserModalProps {
    isOpen: boolean
    onClose: () => void
    availableRoles: TSystemRole[]
}

type TFormValues = Omit<TUser, 'sk' | 'pictureUrl' | 'lastLogin' | 'status'>

const RolesUsersCreateUserModal = ({
    availableRoles = [],
    isOpen,
    onClose,
}: RolesUsersCreateUserModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()

    const tempUser = useRolesUsersStore((state) => state.tempUser)
    const setTempUser = useRolesUsersStore((state) => state.setTempUser)

    const validationSchema = z.object({
        name: z
            .string()
            .min(
                1,
                t('rolesUsers.createUserModal.validation.firstNameRequired'),
            ),
        parentId: z
            .string()
            .min(1, t('rolesUsers.createUserModal.validation.roleRequired')),
        email: z
            .email(t('rolesUsers.createUserModal.validation.emailInvalid'))
            .min(1, t('rolesUsers.createUserModal.validation.emailRequired')),
        phoneNumber: z
            .string()
            .min(
                8,
                t('rolesUsers.createUserModal.validation.phoneNumberRequired'),
            ),
    })

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<TFormValues>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '',
            parentId: '',
            phoneNumber: '',
            email: '',
        },
    })

    const createMutation = useMutation({
        mutationFn: async (data: TFormValues) => {
            const response = await createUser({
                name: data.name,
                parentId: data.parentId,
                phoneNumber: data.phoneNumber,
                email: data.email,
            })

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            const userName = tempUser?.name
            toast.push(
                <Notification
                    title={`Usuario ${userName ?? ''} creado exitosamente`}
                    type="success"
                />,
            )

            await queryClient.invalidateQueries({
                queryKey: usersKeys.data,
            })
            handleClose()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={error.message || 'Error al crear el usuario'}
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending

    useEffect(() => {
        if (tempUser) {
            reset({
                name: tempUser.name,
                parentId: tempUser.parentId,
                email: tempUser.email,
                phoneNumber: tempUser.phoneNumber,
            })
        } else {
            reset({
                name: '',
                parentId: '',
                phoneNumber: '',
                email: '',
            })
        }
    }, [tempUser, reset])

    const onSubmit = (data: TFormValues) => {
        createMutation.mutate(data)
    }

    const handleClose = () => {
        reset()
        onClose()
        setTempUser(null)
    }

    const roleOptions = availableRoles.map((role) => {
        return {
            value: role.sk,
            label: role.name,
        }
    })

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            closable={false}
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
            onRequestClose={handleClose}
            className="min-w-[50vw]"
        >
            <Form onSubmit={handleSubmit(onSubmit)}>
                <h4 className="text-lg font-semibold mb-6">
                    {t('rolesUsers.createUserModal.title')}
                </h4>
                <div className="flex gap-4 w-full justify-between">
                    <FormItem
                        label={t('rolesUsers.createUserModal.fields.firstName')}
                        invalid={!!errors.name}
                        errorMessage={errors.name?.message}
                        className="w-full"
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder={t(
                                        'rolesUsers.createUserModal.fields.firstNamePlaceholder',
                                    )}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label={t('rolesUsers.createUserModal.fields.role')}
                        invalid={!!errors.parentId}
                        errorMessage={errors.parentId?.message}
                        className="w-full"
                    >
                        <Controller
                            name="parentId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={roleOptions}
                                    value={roleOptions.find(
                                        (opt) => opt.value === field.value,
                                    )}
                                    onChange={(opt) =>
                                        field.onChange(opt?.value)
                                    }
                                />
                            )}
                        />
                    </FormItem>
                </div>
                <div className="flex gap-4 w-full justify-between">
                    <FormItem
                        label={t('rolesUsers.createUserModal.fields.email')}
                        invalid={!!errors.email}
                        errorMessage={errors.email?.message}
                        className="flex-2"
                    >
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder={t(
                                        'rolesUsers.createUserModal.fields.emailPlaceholder',
                                    )}
                                />
                            )}
                        />
                    </FormItem>
                    <PhoneNumberInput
                        name="phoneNumber"
                        control={control}
                        errors={errors}
                        label={t('rolesUsers.createUserModal.fields.phone')}
                    />
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

export default RolesUsersCreateUserModal
