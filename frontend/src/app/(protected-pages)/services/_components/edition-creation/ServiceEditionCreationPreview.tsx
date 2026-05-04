'use client'
import classNames from '@/utils/classNames'
import useTranslation from '@/utils/hooks/useTranslation'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { TDetailedService } from '../../types'
import getServicePriorityText from '../../_utils/getServicePriorityText'
import dayjs from 'dayjs'

interface ServiceEditionCreationPreviewProps {
    service?: TDetailedService | null
}

const ServiceEditionCreationPreview = ({
    service,
}: ServiceEditionCreationPreviewProps) => {
    const t = useTranslation()
    const generatePreviewItem = (label: string, value: string) => {
        return (
            <div className="flex flex-col justify-between">
                <span className="font-bold text-gray-500">{label}</span>
                <span className="font-bold text-black">{value}</span>
            </div>
        )
    }

    const ITEMS = [
        { label: 'services.common.name', value: service?.name || '–' },
        {
            label: 'services.common.contractNumber',
            value: service?.contractNumber || '–',
        },
        {
            label: 'services.common.dateRange',
            value: `${service?.startDate ? dayjs(service.startDate).format('DD/MM/YYYY') : '–'} - ${service?.endDate ? dayjs(service.endDate).format('DD/MM/YYYY') : ''}`,
        },
        {
            label: 'services.common.client',
            value: service?.client?.name || '–',
        },
        {
            label: 'services.common.faena',
            value: service?.chore?.name || '–',
        },
        {
            label: 'services.common.priority',
            value: service?.priority
                ? getServicePriorityText(service?.priority, t)
                : '–',
        },
        {
            label: 'services.common.division',
            value: service?.division?.name || '–',
        },
        {
            label: 'services.common.contractAdmins',
            value:
                service?.managers?.map((admin) => admin.name).join(', ') || '–',
            mode: 'list',
        },
    ]

    return (
        <AdaptiveCard collapsible className="flex flex-col gap-4">
            <h4 className="font-bold mb-6 mt-2">
                {t('services.creation.resumeInfo')}
            </h4>
            <div
                className={classNames(
                    'flex flex-col gap-3 transition-all duration-200',
                    'overflow-hidden',
                )}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ITEMS.map((item) => (
                        <div key={item.label}>
                            {generatePreviewItem(t(item.label), item.value)}
                        </div>
                    ))}
                </div>
            </div>
        </AdaptiveCard>
    )
}
export default ServiceEditionCreationPreview
