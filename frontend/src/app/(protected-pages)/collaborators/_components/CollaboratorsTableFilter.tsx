'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { components } from 'react-select'
import { Form, FormItem } from '@/components/ui/Form'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ControlProps, OptionProps } from 'react-select'
import classNames from '@/utils/classNames'
import { Filter } from '../types'
import getStatusText from '../_utils/getStatusText'
import useTranslation from '@/utils/hooks/useTranslation'
import { useCollaboratorsStore } from '../_store/collaboratorsStore'

type Option = {
    value: string
    label: string
    className: string
}

const { Control } = components

interface CollaboratorsTableFilterProps {
    roles: Option[]
    assignations: Option[]
    status: Option[]
}

const CustomSelectOption = (props: OptionProps<Option>) => {
    return (
        <DefaultOption<Option>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Badge className={data.className} />
                    <span className="ml-2 rtl:mr-2">{label}</span>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<Option>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Badge className={classNames('ml-4', selected.className)} />
            )}
            {children}
        </Control>
    )
}

const validationSchema = z.object({
    role: z.string().optional(),
    assignations: z.string().optional(),
    status: z.string().optional(),
})

const CollaboratorsTableFilter = ({
    roles,
    assignations,
    status,
}: CollaboratorsTableFilterProps) => {
    const t = useTranslation()
    const { filterData, setFilterData } = useCollaboratorsStore()
    const { onAppendQueryParams } = useAppendQueryParams()

    const [filterIsOpen, setFilterIsOpen] = useState(false)

    const EMPTY_OPTION: Option = {
        value: '',
        label: t('common.emptySelectOption'),
        className: '',
    }

    const { handleSubmit, control, reset } = useForm<Filter>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: Filter) => {
        setFilterData(values)
        onAppendQueryParams({
            assignations: values.assignations || '',
            role: values.role || '',
            status: values.status || '',
        })
        setFilterIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => setFilterIsOpen(true)}>
                {t('collaborators.filter.title')}
            </Button>
            <Drawer
                title={t('collaborators.filter.title')}
                isOpen={filterIsOpen}
                onClose={() => setFilterIsOpen(false)}
                onRequestClose={() => setFilterIsOpen(false)}
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <FormItem
                            label={`${t('collaborators.filter.assignationsLabel')}`}
                        >
                            <Controller
                                name="assignations"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        instanceId="assignations"
                                        placeholder={t(
                                            'collaborators.filter.selectPlaceholder',
                                        )}
                                        options={[
                                            EMPTY_OPTION,
                                            ...assignations,
                                        ]}
                                        {...field}
                                        value={assignations.filter(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                        components={{
                                            Option: CustomSelectOption,
                                            Control: CustomControl,
                                        }}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label={t('collaborators.common.role')}>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        instanceId="role"
                                        placeholder={t(
                                            'collaborators.filter.selectPlaceholder',
                                        )}
                                        options={[EMPTY_OPTION, ...roles]}
                                        {...field}
                                        value={roles.filter(
                                            (option) =>
                                                option.value === field.value,
                                        )}
                                        components={{
                                            Option: CustomSelectOption,
                                            Control: CustomControl,
                                        }}
                                        onChange={(option) =>
                                            field.onChange(option?.value)
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label={t('collaborators.filter.statusLabel')}>
                            <div className="mt-4">
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select<Option>
                                            instanceId="status"
                                            placeholder={t(
                                                'collaborators.filter.selectPlaceholder',
                                            )}
                                            options={[
                                                EMPTY_OPTION,
                                                ...status.map((option) => ({
                                                    ...option,
                                                    label: getStatusText(
                                                        option.value,
                                                        t,
                                                    ),
                                                })),
                                            ]}
                                            {...field}
                                            value={
                                                field.value
                                                    ? (status.find(
                                                          (o) =>
                                                              o.value ===
                                                              field.value,
                                                      ) ?? null)
                                                    : null
                                            }
                                            components={{
                                                Option: CustomSelectOption,
                                                Control: CustomControl,
                                            }}
                                            onChange={(option) =>
                                                field.onChange(
                                                    option?.value ?? '',
                                                )
                                            }
                                        />
                                    )}
                                />
                            </div>
                        </FormItem>
                    </div>
                    <Button
                        variant="default"
                        type="button"
                        className="mt-4 w-full"
                        onClick={() => {
                            reset()
                        }}
                    >
                        {t('collaborators.filter.resetButton')}
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        className="mt-4 w-full"
                    >
                        {t('collaborators.filter.applyButton')}
                    </Button>
                </Form>
            </Drawer>
        </>
    )
}

export default CollaboratorsTableFilter
