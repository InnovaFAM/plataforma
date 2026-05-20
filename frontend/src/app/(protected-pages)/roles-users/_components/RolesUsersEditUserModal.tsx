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
import { TEditUser, TSystemRole, TUser } from '../types'
import { useRolesUsersStore } from '../_store/rolesUsersStore'
import PhoneNumberInput from '@/components/shared/PhoneInput'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersKeys } from '@/server/actions/users/users-keys'
import { useShallow } from 'zustand/react/shallow'
import { updateUser } from '@/server/actions/users/update'

interface RolesUsersEditUserModalProps {
    isOpen: boolean
    onClose: () => void
    selectedUser: TUser | null
    availableRoles: TSystemRole[]
}

type TFormValues = Omit<TUser, 'sk' | 'pictureUrl' | 'lastLogin' | 'status'>

const RolesUsersEditUserModal = ({
    selectedUser,
    isOpen,
    onClose,
    availableRoles = [],
}: RolesUsersEditUserModalProps) => {
    const t = useTranslation()
    const queryClient = useQueryClient()
    const [tempUser, setTempUser] = useRolesUsersStore(
        useShallow((state) => [state.tempUser, state.setTempUser]),
    )

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

    const updateMutation = useMutation({
        mutationFn: async (data: TEditUser) => {
            const response = await updateUser(tempUser!.sk, data)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            const userEmail = tempUser?.email
            toast.push(
                <Notification
                    title={`Usuario ${userEmail ?? ''} actualizado exitosamente`}
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
                    title={error.message || 'Error al actualizar el usuario'}
                    type="danger"
                />,
            )
        },
    })

    const isPending = updateMutation.isPending

    useEffect(() => {
        if (selectedUser) {
            setTempUser(selectedUser)
            reset({
                name: selectedUser.name,
                parentId: selectedUser.parentId,
                email: selectedUser.email,
                phoneNumber: selectedUser.phoneNumber,
            })
        } else {
            reset({
                name: '',
                parentId: '',
                phoneNumber: '',
                email: '',
            })
        }
    }, [selectedUser, setTempUser, reset])

    const onSubmit = (data: TFormValues) => {
        const payload: TEditUser = {}
        payload.name = tempUser?.name !== data.name ? data.name : ''
        payload.phoneNumber =
            tempUser?.phoneNumber !== data.phoneNumber ? data.phoneNumber : ''
        payload.parentId =
            tempUser?.parentId !== data.parentId ? data.parentId : ''

        if (Object.values(payload).some((v) => v !== '')) {
            Object.keys(payload).forEach((key: string) => {
                if (payload[key as keyof TEditUser] === '')
                    delete payload[key as keyof TEditUser]
            })
            updateMutation.mutate(payload)
            return
        }

        toast.push(
            <Notification type="warning">
                No hay cambios que actualizar
            </Notification>,
        )
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
            shouldCloseOnEsc={!isPending}
            shouldCloseOnOverlayClick={!isPending}
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
                            disabled
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
                        Actualizar
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default RolesUsersEditUserModal
