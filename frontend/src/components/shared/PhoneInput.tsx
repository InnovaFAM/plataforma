import {
    Control,
    Controller,
    FieldErrors,
    FieldValues,
    Path,
    PathValue,
} from 'react-hook-form'
import { Avatar, FormItem } from '../ui'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import NumericInput from './NumericInput'
import {
    components,
    GroupBase,
    OptionProps,
    type ControlProps,
} from 'react-select'
import { useMemo } from 'react'
import { countryList } from '@/constants/countries.constant'
import { NumberFormatValues } from 'react-number-format/types/types'
import useTranslation from '@/utils/hooks/useTranslation'

interface PhoneNumberInputProps<T extends FieldValues> {
    control: Control<T>
    errors: FieldErrors<T>
    name: Path<T>
    label?: string
}

type CountryOption = {
    label: string
    dialCode: string
    value: string
}

const { Control: SelectControl } = components

const CustomControl = ({ children, ...props }: ControlProps<CountryOption>) => {
    const selected = props.getValue()[0]
    return (
        <SelectControl {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={20}
                    src={`/img/countries/${selected.value}.png`}
                />
            )}
            {children}
        </SelectControl>
    )
}

const PhoneNumberInput = <T extends FieldValues>({
    control,
    errors,
    name,
    label = 'Phone number',
}: PhoneNumberInputProps<T>) => {
    const t = useTranslation()

    const dialCodeList = useMemo(() => {
        return countryList.map((country) => ({
            ...country,
            label: country.dialCode,
        }))
    }, [])

    // Función auxiliar para separar el dialCode del número
    const splitValue = (fullValue: string = '') => {
        const country = dialCodeList.find((c) =>
            fullValue.startsWith(c.dialCode),
        )
        if (country) {
            return {
                dialCode: country.dialCode,
                number: fullValue.replace(country.dialCode, ''),
            }
        }
        return { dialCode: '', number: fullValue }
    }

    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value, onBlur } }) => {
                const { dialCode, number } = splitValue(value as string)

                const handleDialChange = (newDial: string) => {
                    onChange(`${newDial}${number}` as PathValue<T, Path<T>>)
                }

                const handleNumberChange = (values: NumberFormatValues) => {
                    onChange(
                        `${dialCode}${values.value}` as PathValue<T, Path<T>>,
                    )
                }

                return (
                    <div className="flex flex-col gap-2 mb-6">
                        <label className="form-label">{label}</label>
                        <div className="flex items-start gap-4 w-full">
                            <FormItem
                                invalid={Boolean(errors[name])}
                                className="mb-0"
                            >
                                <Select<CountryOption>
                                    instanceId="dial-code"
                                    options={dialCodeList}
                                    className="w-[140px]"
                                    isDisabled
                                    components={{
                                        Option: (
                                            props: OptionProps<
                                                CountryOption,
                                                false,
                                                GroupBase<CountryOption>
                                            >,
                                        ) => (
                                            <DefaultOption<CountryOption>
                                                {...(props as OptionProps<
                                                    CountryOption,
                                                    boolean,
                                                    GroupBase<CountryOption>
                                                >)}
                                                customLabel={(data) => (
                                                    <span className="flex items-center gap-2">
                                                        <Avatar
                                                            shape="circle"
                                                            size={20}
                                                            src={`/img/countries/${data.value}.png`}
                                                        />
                                                        <span>
                                                            {data.dialCode}
                                                        </span>
                                                    </span>
                                                )}
                                            />
                                        ),
                                        Control: CustomControl,
                                    }}
                                    defaultValue={dialCodeList.find(
                                        (opt) => opt.dialCode === '+56',
                                    )}
                                    value={dialCodeList.find(
                                        (opt) => opt.dialCode === dialCode,
                                    )}
                                    onChange={(opt) =>
                                        handleDialChange(opt?.dialCode || '')
                                    }
                                    placeholder={t(
                                        'phoneInput.dialCodePlaceholder',
                                    )}
                                />
                            </FormItem>
                            <FormItem
                                className="w-full mb-0"
                                invalid={Boolean(errors[name])}
                                errorMessage={errors[name]?.message as string}
                            >
                                <NumericInput
                                    autoComplete="off"
                                    placeholder={t(
                                        'phoneInput.phoneNumberPlaceholder',
                                    )}
                                    value={number}
                                    onValueChange={handleNumberChange}
                                    onBlur={onBlur}
                                />
                            </FormItem>
                        </div>
                    </div>
                )
            }}
        />
    )
}

export default PhoneNumberInput
