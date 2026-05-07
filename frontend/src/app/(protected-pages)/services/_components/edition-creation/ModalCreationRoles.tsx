import {
    Dialog,
    Input,
    FormItem,
    Form,
    DatePicker,
    Select,
    Button,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { TServiceRole, TServiceRoleTemp } from '../../types'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import { listBackOfficeRoles } from '@/server/actions/backoffice/list-roles'
import { useServicesStore } from '../../_store/servicesStore'
import { getDateFromString } from '../../_utils/getDateFromString'

type ModalCreationRolesProps = {
    roles: TServiceRole[]
    isOpen: boolean
    onClose: () => void
    temporalRole?: TServiceRoleTemp | null
}

const ModalCreationRoles: React.FC<ModalCreationRolesProps> = ({
    roles,
    isOpen,
    onClose,
    temporalRole,
}) => {
    const t = useTranslation()

    const service = useServicesStore((state) => state.tempService)
    const upsertRoleToCreate = useServicesStore(
        (state) => state.upsertRoleToCreate,
    )
    const [dateRange, setDateRange] = useState<
        [Date | undefined, Date | undefined]
    >([undefined, undefined])

    const { data: backofficeRoles, isLoading: isLoadingBackofficeRoles } =
        useQuery({
            queryKey: backOfficeKeys.roles(),
            queryFn: async () => {
                const response = await listBackOfficeRoles(undefined, 500)
                if (!response.success) {
                    throw new Error(response.error)
                }
                return response.data
            },
        })

    const isEditing = temporalRole !== null

    const onSubmit = async (data: FormValues) => {
        const startedAt = dateRange[0]?.toISOString() || ''
        const endedAt = dateRange[1]?.toISOString() || ''
        const roleName = data.name ? data.name : temporalRole!.roleName

        upsertRoleToCreate({
            roleName: roleName,
            sk:
                backofficeRoles?.items.find((role) => role.name === roleName)
                    ?.sk || '',
            required: String(data.required),
            startedAt,
            endedAt,
        })
        onClose()
    }

    const getAvailableRoles = () => {
        const filtered = backofficeRoles?.items.filter(
            (role) => !roles.find((r) => r.sk === role.sk),
        )
        return filtered?.map((role) => ({
            label: role.name,
            value: role.sk,
        }))
    }

    const getRoleValue = (value: string) => {
        if (temporalRole) {
            const selectedRole = backofficeRoles?.items.find(
                (role) => role.name === temporalRole?.roleName,
            )

            return {
                label: selectedRole?.name,
                value: selectedRole?.sk,
            }
        }
        if (!value) return null
        const selectedRole = backofficeRoles?.items.find(
            (role) => role.sk === value,
        )
        return {
            label: selectedRole?.name,
            value: selectedRole?.sk,
        }
    }

    const validationSchema = z.object({
        name: z.string().min(1, t('common.required')),
        dateRange: z.array(z.date() || undefined).min(1, t('common.required')),
        required: z.number().min(1, t('common.required')),
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
            dateRange: [
                temporalRole?.startedAt
                    ? getDateFromString(temporalRole.startedAt)
                    : service?.startDate
                      ? getDateFromString(service?.startDate)
                      : undefined,
                temporalRole?.endedAt
                    ? getDateFromString(temporalRole.endedAt)
                    : service?.endDate
                      ? getDateFromString(service?.endDate)
                      : undefined,
            ],
            required: 1,
        },
    })

    const handleClose = () => {
        reset()
        onClose()
    }

    useEffect(() => {
        if (isEditing && temporalRole) {
            const dr: [Date | undefined, Date | undefined] = [
                temporalRole.startedAt
                    ? getDateFromString(temporalRole.startedAt.split('T')[0])
                    : undefined,
                temporalRole.endedAt
                    ? getDateFromString(temporalRole.endedAt.split('T')[0])
                    : undefined,
            ]
            setDateRange(dr)
            reset({
                name: temporalRole.roleName,
                dateRange: dr,
                required: temporalRole.required
                    ? parseInt(temporalRole.required)
                    : 1,
            })
        } else {
            const dr: [Date | undefined, Date | undefined] = [
                service?.startDate
                    ? getDateFromString(service?.startDate)
                    : undefined,
                service?.endDate
                    ? getDateFromString(service?.endDate)
                    : undefined,
            ]
            setDateRange(dr)
            reset({
                name: '',
                dateRange: dr,
                required: 1,
            })
        }
    }, [temporalRole, isOpen, reset, isEditing, service])

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            onRequestClose={handleClose}
        >
            <Form onSubmit={handleSubmit(onSubmit)}>
                <h5 className="mb-6 font-bold text-lg">
                    {isEditing
                        ? t('services.actions.edit')
                        : t('services.creation.addRoles')}
                </h5>

                <div className="flex flex-col gap-2">
                    <FormItem
                        label={t('services.creation.table.roleName')}
                        invalid={!!errors.name}
                        errorMessage={errors.name?.message}
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={getRoleValue(field.value)}
                                    placeholder={t(
                                        'services.common.roleNamePlaceholder',
                                    )}
                                    options={getAvailableRoles()}
                                    onChange={(opt) =>
                                        field.onChange(opt?.value)
                                    }
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('services.common.requiredPeople')}
                        invalid={!!errors.required}
                        errorMessage={errors.required?.message}
                    >
                        <Controller
                            name="required"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="number"
                                    min={1}
                                    onChange={(e) =>
                                        field.onChange(parseInt(e.target.value))
                                    }
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label={t('services.common.startEndDate')}
                        invalid={!!errors.dateRange || !!errors.dateRange}
                        errorMessage={errors.dateRange?.message}
                    >
                        <div className="flex items-center gap-2">
                            <Controller
                                name="dateRange"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker.DatePickerRange
                                        placeholder="Selecciona el rango de fechas"
                                        minDate={
                                            service?.startDate
                                                ? new Date(service?.startDate)
                                                : undefined
                                        }
                                        maxDate={
                                            service?.endDate
                                                ? new Date(service?.endDate)
                                                : undefined
                                        }
                                        value={
                                            dateRange as [
                                                Date | null,
                                                Date | null,
                                            ]
                                        }
                                        onChange={(date) =>
                                            setDateRange(
                                                date as [
                                                    Date | undefined,
                                                    Date | undefined,
                                                ],
                                            )
                                        }
                                    />
                                )}
                            />
                        </div>
                    </FormItem>
                </div>

                <div className="flex justify-end gap-2 mt-8">
                    <Button variant="plain" type="button" onClick={handleClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        onClick={() => {
                            onSubmit({
                                name:
                                    backofficeRoles?.items.find(
                                        (role) =>
                                            role.sk ===
                                            control._formValues['name'],
                                    )?.name || '',
                                dateRange: [
                                    dateRange[0] as Date,
                                    dateRange[1] as Date,
                                ],
                                required: control._formValues['required'],
                            })
                        }}
                    >
                        {isEditing ? t('common.save') : t('common.add')}
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default ModalCreationRoles
