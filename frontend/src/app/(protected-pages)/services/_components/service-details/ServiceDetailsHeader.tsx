'use client'

import Button from '@/components/ui/Button'
import useTranslation from '@/utils/hooks/useTranslation'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useServicesStore } from '../../_store/servicesStore'
import { getServiceById } from '@/server/actions/services/get-service-by-id'
import { serviceKeys } from '@/server/actions/services/service-keys'
import Skeleton from '@/components/ui/Skeleton/Skeleton'

interface ServiceDetailsHeaderProps {
    serviceId: string
}

const ServiceDetailsHeader = ({ serviceId }: ServiceDetailsHeaderProps) => {
    const t = useTranslation()
    const router = useRouter()

    const setTempService = useServicesStore((state) => state.setTempService)

    const { data: service, isLoading } = useQuery({
        queryKey: serviceKeys.serviceById(serviceId),
        queryFn: async () => {
            const response = await getServiceById(serviceId)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
    })

    const handleEdit = () => {
        setTempService(service || null)
        router.push(`/services/${encodeURIComponent(serviceId)}?view=edit`)
    }

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center">
                    {`${t('services.common.contractNumber')}`}
                    {isLoading ? (
                        <Skeleton className="ml-4 w-32 h-6" />
                    ) : (
                        ` ${service?.contractNumber}`
                    )}
                </h3>
                <div className="flex gap-2">
                    <Button disabled={isLoading}>
                        {t('services.tools.exportButton')}
                    </Button>
                    <Button
                        variant="solid"
                        onClick={() => handleEdit()}
                        disabled={isLoading}
                    >
                        {t('services.header.editButton')}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ServiceDetailsHeader
