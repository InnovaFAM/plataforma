import { Input } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import DatePicker from '@/components/ui/DatePicker'
import { TDetailedService } from '../../types'
import dayjs from 'dayjs'

const { DatePickerRange } = DatePicker

interface ServiceEditionCreationBasicInformationProps {
    isEditing: boolean
    service?: TDetailedService | null
    onValueChange?: (
        prop: keyof TDetailedService,
        value: TDetailedService[keyof TDetailedService],
    ) => void
    onMultipleValueChange?: (values: Partial<TDetailedService>) => void
}

const ServiceEditionCreationBasicInformation = ({
    service,
    onValueChange,
    isEditing,
    onMultipleValueChange,
}: ServiceEditionCreationBasicInformationProps) => {
    const t = useTranslation()

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value

        const validatedValue = rawValue
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, '')
            .slice(0, 10)

        onValueChange?.('code', validatedValue)
    }

    return (
        <div className="flex flex-col gap-6 pb-4">
            <h4 className="font-bold mb-4">
                {t('services.creation.basicInfo')}
            </h4>
            <div className="flex w-full gap-6">
                <label className="text-xs font-bold w-full">
                    {t('services.common.name')}
                    <Input
                        className="mt-2"
                        placeholder={t('services.creation.namePlaceholder')}
                        value={service?.name || ''}
                        onChange={(e) =>
                            onValueChange?.('name', e.target.value)
                        }
                    />
                </label>
                <label className="text-xs font-bold w-full">
                    {t('services.common.code')}
                    <Input
                        className="mt-2"
                        disabled={isEditing}
                        placeholder={t('services.creation.codePlaceholder')}
                        value={service?.code || ''}
                        onChange={handleCodeChange}
                    />
                </label>
            </div>
            <label className="text-xs font-bold">
                {t('services.common.contractNumber')}
                <Input
                    className="mt-2"
                    placeholder={t(
                        'services.creation.contractNumberPlaceholder',
                    )}
                    value={service?.contractNumber || ''}
                    onChange={(e) =>
                        onValueChange?.('contractNumber', e.target.value)
                    }
                />
            </label>
            <label className="text-xs font-bold">
                {t('services.common.startEndDate')}
                <DatePickerRange
                    className="mt-2"
                    placeholder={t('services.creation.startEndDatePlaceholder')}
                    value={
                        service?.startDate && service?.endDate
                            ? [
                                  dayjs(service.startDate).toDate(),
                                  dayjs(service.endDate).toDate(),
                              ]
                            : undefined
                    }
                    onChange={(dates) => {
                        if (!dates[0] || !dates[1]) return
                        onMultipleValueChange?.({
                            startDate: dayjs(dates[0]).format('YYYY-MM-DD'),
                            endDate: dayjs(dates[1]).format('YYYY-MM-DD'),
                        })
                    }}
                />
            </label>
        </div>
    )
}

export default ServiceEditionCreationBasicInformation
