import {
    Button,
    DatePicker,
    Dialog,
    Form,
    FormItem,
    Input,
} from '@/components/ui'

import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TSubContract, TSubContractManager } from '../../types'
import useTranslation from '@/utils/hooks/useTranslation'
import { getDateFromString } from '../../_utils/getDateFromString'
import { useServicesStore } from '../../_store/servicesStore'
import { isValidEmail } from '../../_utils/isValidEmail'

type TModalAddSubContract = {
    open: boolean
    data: TSubContract[]
    editingSubContract: TSubContract | null
    onClose: (updatedSubContracts?: TSubContract[]) => void
}

type ContractManagerDraft = {
    name: string
    email: string
    phoneNumber: string
}

const ModalAddSubContract: React.FC<TModalAddSubContract> = ({
    open,
    data,
    editingSubContract,
    onClose,
}) => {
    const t = useTranslation()
    const { tempService } = useServicesStore()

    const [dateRange, setDateRange] = useState<
        [Date | undefined, Date | undefined]
    >([undefined, undefined])

    const [contractManagerDraft, setContractManagerDraft] =
        useState<ContractManagerDraft>({
            name: '',
            email: '',
            phoneNumber: '',
        })

    const handleAddContractManager = () => {
        const name = contractManagerDraft.name.trim()
        const email = contractManagerDraft.email.trim()
        const phoneNumber = contractManagerDraft.phoneNumber.trim()

        if (!name || !email || !phoneNumber) return

        const currentManagers = getValues('contractManagers') ?? []

        const alreadyExists = currentManagers.some(
            (manager) => manager.email?.toLowerCase() === email.toLowerCase(),
        )

        if (alreadyExists) return

        appendContractManager({
            name,
            email,
            phoneNumber: `+${phoneNumber}`,
        })

        clearErrors('contractManagers')

        setContractManagerDraft({
            name: '',
            email: '',
            phoneNumber: '',
        })
    }

    const validationSchema = z.object({
        companyName: z
            .string()
            .min(
                1,
                t(
                    'services.creation.subContractModal.validation.companyNameRequired',
                ),
            ),
        contractManagers: z
            .array(
                z.object({
                    name: z
                        .string()
                        .min(
                            1,
                            t(
                                'services.creation.subContractModal.validation.managerNameRequired',
                            ),
                        ),
                    email: z.email(
                        t(
                            'services.creation.subContractModal.validation.managerEmailInvalid',
                        ),
                    ),
                    phoneNumber: z.string('El número es inválido'),
                }),
            )
            .min(
                1,
                t(
                    'services.creation.subContractModal.validation.contractManagersRequired',
                ),
            ),
        dateRange: z.array(z.date() || undefined).min(1, t('common.required')),
    })

    type FormValues = z.infer<typeof validationSchema>

    const {
        handleSubmit,
        control,
        reset,
        getValues,
        clearErrors,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            companyName: '',
            contractManagers: [],
            dateRange: [
                editingSubContract?.startDate
                    ? getDateFromString(editingSubContract.startDate)
                    : tempService?.startDate
                      ? getDateFromString(tempService?.startDate)
                      : undefined,
                editingSubContract?.endDate
                    ? getDateFromString(editingSubContract.endDate)
                    : tempService?.endDate
                      ? getDateFromString(tempService?.endDate)
                      : undefined,
            ],
        },
    })

    const {
        fields: contractManagerFields,
        append: appendContractManager,
        remove: removeContractManager,
    } = useFieldArray({
        control,
        name: 'contractManagers',
    })

    const contractManagerError =
        typeof errors.contractManagers?.message === 'string'
            ? errors.contractManagers.message
            : undefined

    const onSubmit = (values: FormValues) => {
        const startedAt = dateRange[0]?.toISOString() || ''
        const endedAt = dateRange[1]?.toISOString() || ''
        const updatedSubContract: TSubContract = {
            companyName: values.companyName,
            contractManagers: values.contractManagers as TSubContractManager[],
            startDate: startedAt,
            endDate: endedAt,
        }

        let updatedSubContracts: TSubContract[]
        if (editingSubContract) {
            updatedSubContracts = data.map((subContract) =>
                subContract === editingSubContract
                    ? updatedSubContract
                    : subContract,
            )
        } else {
            updatedSubContracts = [...data, updatedSubContract]
        }
        handleClose(updatedSubContracts)
    }

    useEffect(() => {
        if (editingSubContract) {
            const dr: [Date | undefined, Date | undefined] = [
                editingSubContract.startDate
                    ? getDateFromString(editingSubContract.startDate)
                    : undefined,
                editingSubContract.endDate
                    ? getDateFromString(editingSubContract.endDate)
                    : undefined,
            ]
            setDateRange(dr)
            reset({
                companyName: editingSubContract.companyName,
                contractManagers: editingSubContract.contractManagers,
                dateRange: dr,
            })
        } else {
            const dr: [Date | undefined, Date | undefined] = [
                tempService?.startDate
                    ? getDateFromString(tempService?.startDate)
                    : undefined,
                tempService?.endDate
                    ? getDateFromString(tempService?.endDate)
                    : undefined,
            ]
            setDateRange(dr)
            reset({
                companyName: '',
                contractManagers: [],
                dateRange: dr,
            })
        }
    }, [editingSubContract, reset, tempService])

    const handleClose = (
        updatedSubContracts: TSubContract[] | undefined = undefined,
    ) => {
        reset()
        onClose(updatedSubContracts)
    }

    return (
        <Dialog
            isOpen={open}
            onClose={() => handleClose()}
            onRequestClose={() => handleClose()}
            width={980}
        >
            <Form
                onSubmit={handleSubmit(onSubmit, (formErrors) => {
                    console.log('Form invalid:', formErrors)
                })}
            >
                <h2 className="text-lg font-bold mb-6">
                    {editingSubContract
                        ? t('services.creation.editSubContract')
                        : t('services.creation.addSubContract')}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
                    <div className="flex flex-col">
                        <FormItem
                            label={t(
                                'services.creation.subContractModal.companyNameLabel',
                            )}
                            invalid={!!errors.companyName}
                            errorMessage={errors.companyName?.message}
                        >
                            <Controller
                                name="companyName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder={t(
                                            'services.creation.subContractModal.companyNamePlaceholder',
                                        )}
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem
                            label="dateRange"
                            invalid={!!errors.dateRange}
                            errorMessage={`Rango de fechas erróneas}`}
                        >
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="dateRange"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker.DatePickerRange
                                            placeholder="Selecciona el rango de fechas"
                                            minDate={
                                                tempService?.startDate
                                                    ? new Date(
                                                          tempService?.startDate,
                                                      )
                                                    : undefined
                                            }
                                            maxDate={
                                                tempService?.endDate
                                                    ? new Date(
                                                          tempService?.endDate,
                                                      )
                                                    : undefined
                                            }
                                            value={
                                                dateRange as [
                                                    Date | null,
                                                    Date | null,
                                                ]
                                            }
                                            onChange={(date) => {
                                                field.onChange(date)
                                                setDateRange(
                                                    date as [
                                                        Date | undefined,
                                                        Date | undefined,
                                                    ],
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        </FormItem>

                        <FormItem
                            label="ADC agregados"
                            invalid={!!errors.contractManagers}
                            errorMessage={contractManagerError}
                        >
                            {contractManagerFields.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                                    Aún no has agregado administradores de
                                    contrato.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {contractManagerFields.map(
                                        (manager, index) => (
                                            <div
                                                key={manager.id}
                                                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900">
                                                        {manager.name}
                                                    </div>

                                                    <div className="text-sm text-gray-500 truncate">
                                                        {manager.email}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {manager.phoneNumber}
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="plain"
                                                    onClick={() =>
                                                        removeContractManager(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </FormItem>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">
                                Agregar ADC
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Crea un administrador de contrato y agrégalo al
                                subcontrato.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <FormItem label="Nombre">
                                <Input
                                    value={contractManagerDraft.name}
                                    placeholder="Ej: Juan Pérez"
                                    onChange={(event) =>
                                        setContractManagerDraft((current) => ({
                                            ...current,
                                            name: event.target.value,
                                        }))
                                    }
                                />
                            </FormItem>

                            <FormItem label="Correo">
                                <Input
                                    type="email"
                                    value={contractManagerDraft.email}
                                    placeholder="Ej: juan@empresa.cl"
                                    onChange={(event) =>
                                        setContractManagerDraft((current) => ({
                                            ...current,
                                            email: event.target.value,
                                        }))
                                    }
                                />
                            </FormItem>

                            <FormItem label="Número">
                                <Input
                                    value={contractManagerDraft.phoneNumber}
                                    placeholder="ej 569 1234 5678"
                                    type="tel"
                                    pattern="[0-9]*"
                                    maxLength={11}
                                    minLength={11}
                                    onChange={(event) => {
                                        setContractManagerDraft((current) => ({
                                            ...current,
                                            phoneNumber:
                                                event.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ),
                                        }))
                                    }}
                                />
                            </FormItem>

                            <Button
                                type="button"
                                className="w-full"
                                onClick={handleAddContractManager}
                                disabled={
                                    !contractManagerDraft.name.trim() ||
                                    !contractManagerDraft.email.trim() ||
                                    !contractManagerDraft.phoneNumber.trim() ||
                                    !isValidEmail(contractManagerDraft.email)
                                }
                            >
                                Agregar ADC
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-8">
                    <Button
                        type="button"
                        variant="plain"
                        onClick={() => handleClose()}
                    >
                        {t('common.cancel')}
                    </Button>

                    <Button type="submit">
                        {editingSubContract
                            ? t('common.save')
                            : t('common.add')}
                    </Button>
                </div>
            </Form>
        </Dialog>
    )
}

export default ModalAddSubContract
