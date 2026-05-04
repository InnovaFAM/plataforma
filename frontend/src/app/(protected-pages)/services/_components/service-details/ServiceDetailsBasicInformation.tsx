import useTranslation from '@/utils/hooks/useTranslation'
import { TDetailedService } from '../../types'
import getServicePriorityText from '../../_utils/getServicePriorityText'
import getStatusText from '../../_utils/getStatusText'
import React from 'react'
import Skeleton from '@/components/ui/Skeleton/Skeleton'

interface ServiceDetailsBasicInformationProps {
    service?: TDetailedService
    isLoading?: boolean
}

const ServiceDetailsBasicInformation = ({
    service,
    isLoading = false,
}: ServiceDetailsBasicInformationProps) => {
    const t = useTranslation()

    const basicData = [
        {
            label: isLoading ? (
                <Skeleton className="ml-4 w-32 h-6" />
            ) : (
                service?.name
            ),
            value: isLoading ? (
                <Skeleton className="ml-4 w-32 h-4" />
            ) : (
                `${t('services.common.contractNumber')}: ${service?.contractNumber || '–'}`
            ),
        },
        {
            label: t('services.common.client'),
            value: isLoading ? (
                <Skeleton className="ml-4 w-32 h-4" />
            ) : (
                service?.client?.name || '–'
            ),
        },
        {
            label: t('services.common.faena'),
            value: isLoading ? (
                <Skeleton className="ml-4 w-32 h-4" />
            ) : (
                service?.chore?.name || '–'
            ),
        },
        {
            label: t('services.common.division'),
            value: isLoading ? (
                <Skeleton className="ml-4 w-32 h-4" />
            ) : (
                service?.division?.name || '–'
            ),
        },
        {
            label: t('services.common.priority'),
            value: isLoading ? (
                <Skeleton className="ml-4 w-32 h-4" />
            ) : (
                getServicePriorityText(service?.priority || '', t) || '–'
            ),
        },
        {
            label: t('services.common.status'),
            value: isLoading ? (
                <Skeleton className="ml-4 w-32 h-4" />
            ) : (
                getStatusText(service?.status || undefined, t) || '–'
            ),
        },
    ]

    return (
        <div className="flex justify-between items-center gap-2 px-4 py-2">
            {basicData.map((data, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col gap-1 items-center">
                        <span className="text-sm text-black font-bold">
                            {data.label}
                        </span>
                        <span className="font-medium text-gray-600">
                            {data.value}
                        </span>
                    </div>
                    {index < basicData.length - 1 && (
                        <div className="h-8 border-l border-gray-300 mx-2" />
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

export default ServiceDetailsBasicInformation
