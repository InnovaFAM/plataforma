import {
    Button,
    DatePicker,
    Dialog,
    Form,
    FormItem,
    Input,
} from '@/components/ui'

import { z } from 'zod'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TbMinus } from 'react-icons/tb'
import { TContractManager, TSubContractManager } from '../../types'
import useTranslation from '@/utils/hooks/useTranslation'

type TModalAddSubContract = {
    open: boolean
    data: TSubContractManager[]
    editingSubContract: TSubContractManager | null
    onClose: (updatedSubContracts?: TSubContractManager[]) => void
}

type ContractManagerDraft = {
    name: string
    email: string
    phone: string
}

const ModalAddSubContract: React.FC<TModalAddSubContract> = ({
    open,
    data,
    editingSubContract,
    onClose,
}) => {
    const t = useTranslation()

    const [contractManagerDraft, setContractManagerDraft] =
        useState<ContractManagerDraft>({
            name: '',
            email: '',
            phone: '',
        })

    const handleAddContractManager = () => {
        const name = contractManagerDraft.name.trim()
        const email = contractManagerDraft.email.trim()
        const phone = contractManagerDraft.phone.trim()

        if (!name || !email || !phone) return

        const currentManagers = getValues('contractManagers') ?? []

        const alreadyExists = currentManagers.some(
            (manager) => manager.email?.toLowerCase() === email.toLowerCase(),
        )

        if (alreadyExists) return

        appendContractManager({
            name,
            email,
            phone,
        })

        clearErrors('contractManagers')

        setContractManagerDraft({
            name: '',
            email: '',
            phone: '',
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
                    email: z
                        .string()
                        .email(
                            t(
                                'services.creation.subContractModal.validation.managerEmailInvalid',
                            ),
                        ),
                    phone: z.string().optional(),
                }),
            )
            .min(
                1,
                t(
                    'services.creation.subContractModal.validation.contractManagersRequired',
                ),
            ),
        startDate: z
            .string()
            .min(
                1,
                t(
                    'services.creation.subContractModal.validation.datesRequired',
                ),
            ),
        endDate: z
            .string()
            .min(
                1,
                t(
                    'services.creation.subContractModal.validation.datesRequired',
                ),
            ),
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
            startDate: '',
            endDate: '',
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
        const updatedSubContract: TSubContractManager = {
            companyName: values.companyName,
            contractManagers: values.contractManagers as TContractManager[],
            startDate: values.startDate,
            endDate: values.endDate,
        }

        let updatedSubContracts: TSubContractManager[]
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
            reset(editingSubContract)
        } else {
            reset({
                companyName: '',
                contractManagers: [],
                startDate: '',
                endDate: '',
            })
        }
    }, [editingSubContract, reset])

    const handleClose = (
        updatedSubContracts: TSubContractManager[] | undefined = undefined,
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
                            label={t(
                                'services.creation.subContractModal.datesLabel',
                            )}
                            invalid={!!errors.startDate || !!errors.endDate}
                            errorMessage={
                                errors.startDate?.message ||
                                errors.endDate?.message
                            }
                        >
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            value={
                                                field.value
                                                    ? dayjs(
                                                          field.value,
                                                      ).toDate()
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
                                                'services.creation.subContractModal.startDatePlaceholder',
                                            )}
                                        />
                                    )}
                                />

                                <TbMinus />

                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            value={
                                                field.value
                                                    ? dayjs(
                                                          field.value,
                                                      ).toDate()
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
                                                'services.creation.subContractModal.endDatePlaceholder',
                                            )}
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
                                                        {manager.phone}
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
                                    value={contractManagerDraft.phone}
                                    placeholder="Ej: +56 9 1234 5678"
                                    onChange={(event) =>
                                        setContractManagerDraft((current) => ({
                                            ...current,
                                            phone: event.target.value,
                                        }))
                                    }
                                />
                            </FormItem>

                            <Button
                                type="button"
                                className="w-full"
                                onClick={handleAddContractManager}
                                disabled={
                                    !contractManagerDraft.name.trim() ||
                                    !contractManagerDraft.email.trim() ||
                                    !contractManagerDraft.phone.trim()
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
