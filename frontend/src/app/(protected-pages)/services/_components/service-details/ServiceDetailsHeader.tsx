'use client'

import { Button, Notification, toast } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useServicesStore } from '../../_store/servicesStore'
import { getServiceById } from '@/server/actions/services/get-service-by-id'
import {
    serviceExportKeys,
    serviceKeys,
} from '@/server/actions/services/service-keys'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import { useCan } from '@/hooks/useCan'
import { exportServiceById } from '@/server/actions/services/export-action'
import useCurrentSession from '@/utils/hooks/useCurrentSession'

interface ServiceDetailsHeaderProps {
    serviceId: string
}

const ServiceDetailsHeader = ({ serviceId }: ServiceDetailsHeaderProps) => {
    const t = useTranslation()
    const router = useRouter()
    const { session } = useCurrentSession()
    const canEditService = useCan('services:edit')
    const canExportReport = useCan('reports:export')
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

    const exportMutation = useMutation({
        mutationKey: serviceExportKeys.service(serviceId),
        mutationFn: () => exportServiceById(serviceId),
        onSuccess: () => {
            toast.push(
                <Notification type="success">
                    Recibirás en los próximos minutos el informe del servicio{' '}
                    {service?.name} a tu correo {session?.user.email}.
                </Notification>,
            )
        },
        onError: (error) => {
            toast.push(
                <Notification type="danger">
                    Hubo un error al generar el informe para el servicio{' '}
                    {service?.name}. {error.message}
                </Notification>,
            )
        },
    })

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
                    {canExportReport && (
                        <Button
                            onClick={() => exportMutation.mutate()}
                            disabled={isLoading || exportMutation.isPending}
                            loading={exportMutation.isPending}
                        >
                            {exportMutation.isPending
                                ? 'Exportando...'
                                : t('services.tools.exportButton')}
                        </Button>
                    )}
                    {canEditService && (
                        <Button
                            variant="solid"
                            onClick={() => handleEdit()}
                            disabled={isLoading}
                        >
                            {t('services.header.editButton')}
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}

export default ServiceDetailsHeader
