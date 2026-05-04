'use client'
import { useEffect, useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import { z } from 'zod'
import { HiOutlinePlusCircle, HiOutlineMinusCircle } from 'react-icons/hi'
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import useTranslation from '@/utils/hooks/useTranslation'
import {
    TContractManager,
    TDetailedService,
    TSubContractManager,
} from '../types'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import classNames from '@/utils/classNames'
import getSubContractStatusText from '../_utils/getSubContractStatusText'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Button,
    DatePicker,
    Dialog,
    Form,
    FormItem,
    Input,
    Select,
    Skeleton,
} from '@/components/ui'
import { TbMinus, TbPencil, TbTrash } from 'react-icons/tb'
import dayjs from 'dayjs'

interface SubContractTableProps {
    data: TSubContractManager[]
    onValueChange?: (
        prop: keyof TDetailedService,
        value: TDetailedService[keyof TDetailedService],
    ) => void
    isLoading?: boolean
}
const { Tr, Th, Td, THead, TBody } = Table

const SubContractTable = ({
    data,
    onValueChange,
    isLoading = false,
}: SubContractTableProps) => {
    const t = useTranslation()
    const [open, setOpen] = useState(false)
    const [editingSubContract, setEditingSubContract] =
        useState<TSubContractManager | null>(null)

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
                    role: z
                        .string()
                        .min(
                            1,
                            t(
                                'services.creation.subContractModal.validation.managerRoleRequired',
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
        status: z.string(),
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
            companyName: '',
            contractManagers: [
                {
                    name: 'Admin 1',
                    email: 'admin1@example.com',
                    role: 'Administrador de Subcontrato 1',
                    phone: '',
                },
                {
                    name: 'Admin 2',
                    email: 'admin2@example.com',
                    role: 'Administrador de Subcontrato 2',
                    phone: '',
                },
            ],
            startDate: '',
            endDate: '',
            status: 'active',
        },
    })

    useEffect(() => {
        if (editingSubContract) {
            reset(editingSubContract)
        } else {
            reset({
                companyName: '',
                contractManagers: [
                    {
                        name: 'Admin 1',
                        email: 'admin1@example.com',
                        role: 'Administrador de Subcontrato 1',
                        phone: '',
                    },
                    {
                        name: 'Admin 2',
                        email: 'admin2@example.com',
                        role: 'Administrador de Subcontrato 2',
                        phone: '',
                    },
                ],
                startDate: '',
                endDate: '',
                status: 'active',
            })
        }
    }, [editingSubContract, reset])

    const handleClose = () => {
        setEditingSubContract(null)
        reset()
        setOpen(false)
    }

    const handleAddSubContract = () => {
        setEditingSubContract(null)
        setOpen(true)
    }

    const onSubmit = (values: FormValues) => {
        const updatedSubContract: TSubContractManager = {
            companyName: values.companyName,
            contractManagers: values.contractManagers as TContractManager[],
            startDate: values.startDate,
            endDate: values.endDate,
            status: values.status,
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

        onValueChange?.('submanagers', updatedSubContracts)
        handleClose()
    }

    const statusOptions = [
        {
            value: 'active',
            label: t('services.creation.subContractModal.statusOptions.active'),
        },
        {
            value: 'inactive',
            label: t(
                'services.creation.subContractModal.statusOptions.inactive',
            ),
        },
    ]

    const ActionColumn = ({
        onEdit,
        onRemove,
    }: {
        onEdit: () => void
        onRemove: () => void
    }) => {
        return (
            <div className="flex items-center justify-start gap-4">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={() => {
                        onRemove()
                    }}
                >
                    <TbTrash />
                </div>
            </div>
        )
    }

    const columns = useMemo<
        ColumnDef<TSubContractManager | TContractManager>[]
    >(
        () => [
            {
                id: 'expander',
                header: ({ table }) => {
                    return (
                        <button
                            className="text-xl"
                            {...{
                                onClick:
                                    table.getToggleAllRowsExpandedHandler(),
                            }}
                        >
                            {table.getIsAllRowsExpanded() ? (
                                <HiOutlineMinusCircle />
                            ) : (
                                <HiOutlinePlusCircle />
                            )}
                        </button>
                    )
                },
                cell: ({ row, getValue }) => {
                    return (
                        <>
                            {row.getCanExpand() ? (
                                <button
                                    className="text-xl"
                                    {...{
                                        onClick: row.getToggleExpandedHandler(),
                                    }}
                                >
                                    {row.getIsExpanded() ? (
                                        <HiOutlineMinusCircle />
                                    ) : (
                                        <HiOutlinePlusCircle />
                                    )}
                                </button>
                            ) : null}
                            {getValue()}
                        </>
                    )
                },
            },
            {
                header: t('services.details.table.name'),
                accessorKey: 'name',
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span className="whitespace-nowrap">
                                {'companyName' in row.original
                                    ? row.original.companyName
                                    : row.original.name}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.adc'),
                accessorKey: 'contractManager',
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span
                                className={classNames(
                                    'whitespace-nowrap',
                                    'contractManagers' in row.original &&
                                        'font-bold text-black',
                                )}
                            >
                                {'contractManagers' in row.original ? (
                                    <>
                                        {row.original.contractManagers.length >
                                        0
                                            ? row.original.contractManagers[0]
                                                  .name
                                            : ''}
                                        {row.original.contractManagers.length >
                                            1 && (
                                            <span className="ml-2 bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                                                +
                                                {(row.original.contractManagers
                                                    .length || 0) - 1}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    row.original.email
                                )}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.startDate'),
                accessorKey: 'startDate',
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center justify-start px-2 py-1">
                            <span
                                className={classNames(
                                    'whitespace-nowrap',
                                    'startDate' in row.original &&
                                        'endDate' in row.original &&
                                        'font-semibold',
                                )}
                            >
                                {'startDate' in row.original &&
                                'endDate' in row.original
                                    ? `${
                                          row.original.startDate
                                              ? getDayJsDate(
                                                    row.original.startDate,
                                                    'YYYY-MM-DD',
                                                )
                                              : '-'
                                      }
                                ➔
                                ${
                                    row.original.endDate
                                        ? getDayJsDate(
                                              row.original.endDate,
                                              'YYYY-MM-DD',
                                          )
                                        : '-'
                                }`
                                    : row.original.phoneNumber || '–'}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: t('services.details.table.status'),
                accessorKey: 'status',
                cell: ({ getValue }) => {
                    const status = getValue() as TSubContractManager['status']

                    return (
                        <span className="whitespace-nowrap">
                            {getSubContractStatusText(status, t)}
                        </span>
                    )
                },
            },
        ],
        [t],
    )

    const [expanded, setExpanded] = useState<ExpandedState>({})

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        getSubRows: (row) => {
            if ('contractManagers' in row) {
                return row.contractManagers || []
            }
            return []
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold mb-4 mt-1">
                    {t('services.details.subContractsAdmins')}
                </h4>
                {onValueChange && (
                    <Button onClick={handleAddSubContract} size="sm">
                        {t('common.add')}
                    </Button>
                )}
            </div>

            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {!data.length && (
                        <Tr>
                            <Td
                                colSpan={columns.length}
                                className="text-center"
                            >
                                {isLoading ? (
                                    <div>
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                        <Skeleton className="mb-4 w-full h-6" />
                                    </div>
                                ) : (
                                    t('services.details.table.noData')
                                )}
                            </Td>
                        </Tr>
                    )}
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Td>
                                    )
                                })}
                                {onValueChange &&
                                'companyName' in row.original ? (
                                    <Td>
                                        <ActionColumn
                                            onEdit={() => {
                                                if (
                                                    'companyName' in
                                                    row.original
                                                ) {
                                                    setEditingSubContract(
                                                        row.original,
                                                    )
                                                    setOpen(true)
                                                }
                                            }}
                                            onRemove={() => {
                                                if (
                                                    'companyName' in
                                                    row.original
                                                ) {
                                                    const updatedSubContracts =
                                                        data.filter(
                                                            (subContract) =>
                                                                subContract !==
                                                                row.original,
                                                        )
                                                    onValueChange(
                                                        'submanagers',
                                                        updatedSubContracts,
                                                    )
                                                }
                                            }}
                                        />
                                    </Td>
                                ) : null}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
            <Dialog
                isOpen={open}
                onClose={handleClose}
                onRequestClose={handleClose}
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <h2 className="text-lg font-bold mb-6">
                        {editingSubContract
                            ? t('services.creation.editSubContract')
                            : t('services.creation.addSubContract')}
                    </h2>

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
                                'services.creation.subContractModal.contractManagersLabel',
                            )}
                            invalid={!!errors.contractManagers}
                            errorMessage={errors.contractManagers?.message}
                        >
                            <Controller
                                name="contractManagers"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        isMulti
                                        {...field}
                                        value={field.value.map((manager) => ({
                                            value: manager.email,
                                            label: manager.name,
                                        }))}
                                        onChange={(opts) =>
                                            field.onChange(
                                                opts.map((opt) => ({
                                                    name: opt.label,
                                                })),
                                            )
                                        }
                                        placeholder={t(
                                            'services.creation.subContractModal.contractManagersPlaceholder',
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
                                                    dayjs(date).format(
                                                        'YYYY-MM-DD',
                                                    ),
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
                                                    dayjs(date).format(
                                                        'YYYY-MM-DD',
                                                    ),
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
                            label={t(
                                'services.creation.subContractModal.statusLabel',
                            )}
                            invalid={!!errors.status}
                            errorMessage={errors.status?.message}
                            className="flex-1"
                        >
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={statusOptions}
                                        value={statusOptions.find(
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

                    <div className="flex justify-end gap-2 mt-8">
                        <Button
                            type="button"
                            variant="plain"
                            onClick={handleClose}
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
        </>
    )
}

export default SubContractTable
