'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Checkbox from '@/components/ui/Checkbox'
import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { components } from 'react-select'
import { Form, FormItem } from '@/components/ui/Form'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbFilter, TbMinus } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ControlProps, OptionProps } from 'react-select'
import classNames from '@/utils/classNames'
import { useServicesStore } from '../_store/servicesStore'
import { DatePicker } from '@/components/ui'
import { Filter, TService } from '../types'
import getStatusText from '../_utils/getStatusText'
import useTranslation from '@/utils/hooks/useTranslation'
import dayjs from 'dayjs'

type Option = {
    value: string
    label: string
    className: string
}

const { Control } = components

interface ServiceStatusOption {
    clients: Option[]
    faenas: Option[]
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
    minDate: z.any().optional(),
    maxDate: z.any().optional(),
    client: z.string().optional(),
    faena: z.string().optional(),
    status: z.array(z.string()).optional(),
})

const ServicesTableFilter = ({
    clients,
    faenas,
    status,
}: ServiceStatusOption) => {
    const t = useTranslation()
    const [filterIsOpen, setFilterIsOpen] = useState(false)
    const { filterData, setFilterData } = useServicesStore()
    const { onAppendQueryParams } = useAppendQueryParams()

    const { handleSubmit, control, reset } = useForm<Filter>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: Filter) => {
        setFilterData(values)

        onAppendQueryParams({
            minDate: values.minDate
                ? dayjs(values.minDate).format('YYYY-MM-DD')
                : '',
            maxDate: values.maxDate
                ? dayjs(values.maxDate).format('YYYY-MM-DD')
                : '',
            client: values.client || '',
            faena: values.faena || '',
            status: values.status?.join(',') || '',
            pageIndex: '1',
        })
        setFilterIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => setFilterIsOpen(true)}>
                {t('services.filter.title')}
            </Button>
            <Drawer
                title={t('services.filter.title')}
                isOpen={filterIsOpen}
                onClose={() => setFilterIsOpen(false)}
                onRequestClose={() => setFilterIsOpen(false)}
            >
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <FormItem
                            label={`${t('services.filter.startDateLabel')} - ${t('services.filter.endDateLabel')}`}
                        >
                            <div className="flex items-center gap-2">
                                <Controller
                                    name="minDate"
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
                                                field.onChange(date)
                                            }
                                            placeholder="Desde"
                                        />
                                    )}
                                />
                                <TbMinus />
                                <Controller
                                    name="maxDate"
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
                                                field.onChange(date)
                                            }
                                            placeholder="Hasta"
                                        />
                                    )}
                                />
                            </div>
                        </FormItem>
                        <FormItem label={t('services.common.client')}>
                            <Controller
                                name="client"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        instanceId="client"
                                        placeholder={t(
                                            'services.filter.selectPlaceholder',
                                        )}
                                        options={clients}
                                        {...field}
                                        value={clients.filter(
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
                        <FormItem label={t('services.common.faena')}>
                            <Controller
                                name="faena"
                                control={control}
                                render={({ field }) => (
                                    <Select<Option>
                                        instanceId="faena"
                                        placeholder={t(
                                            'services.filter.selectPlaceholder',
                                        )}
                                        options={faenas}
                                        {...field}
                                        value={faenas.filter(
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
                        <FormItem label={t('services.filter.statusLabel')}>
                            <div className="mt-4">
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox.Group
                                            vertical
                                            className="flex"
                                            {...field}
                                        >
                                            {status.map((s, index) => (
                                                <Checkbox
                                                    key={s.label + index}
                                                    name={field.name}
                                                    value={s.value}
                                                    className="justify-between flex-row-reverse heading-text"
                                                >
                                                    {getStatusText(
                                                        s.label as TService['status'],
                                                        t,
                                                    )}
                                                </Checkbox>
                                            ))}
                                        </Checkbox.Group>
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
                        {t('services.filter.resetButton')}
                    </Button>
                    <Button
                        variant="solid"
                        type="submit"
                        className="mt-4 w-full"
                    >
                        {t('services.filter.applyButton')}
                    </Button>
                </Form>
            </Drawer>
        </>
    )
}

export default ServicesTableFilter
