import ServicesListSearch from './ServicesListSearch'
import ServicesTableFilter from './ServicesTableFilter'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { Button, toast, Notification } from '@/components/ui'
import { TbCloudDownload } from 'react-icons/tb'
import useTranslation from '@/utils/hooks/useTranslation'
import { TService } from '../types'
import { useCan } from '@/hooks/useCan'
import { useMutation } from '@tanstack/react-query'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { serviceExportKeys } from '@/server/actions/services/service-keys'
import { exportServices } from '@/server/actions/services/export-action'

interface ServicesListTableToolsProps {
    services?: TService[]
}

const ServicesListTableTools = ({ services }: ServicesListTableToolsProps) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const { session } = useCurrentSession()
    const t = useTranslation()
    const canExportReport = useCan('reports:export')
    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
            pageIndex: 1,
        })
    }

    const clients = Array.from(
        new Set(services?.map((service) => service.client).filter(Boolean)),
    ).map((client) => ({
        label: client?.name || '',
        value: client?.sk || '',
        className: '',
    }))

    const faenas = Array.from(
        new Set(
            services?.map((service) => service.chore?.name)?.filter(Boolean),
        ),
    )?.map((faena) => ({
        label: faena || '',
        value: faena || '',
        className: '',
    }))

    const statusValues = Array.from(
        new Set(services?.map((service) => service.status)?.filter(Boolean)),
    )?.map((status) => ({
        label: status || '',
        value: status || '',
        className: '',
    }))

    const exportMutation = useMutation({
        mutationKey: serviceExportKeys.services,
        mutationFn: exportServices,
        onSuccess: ({ data }) => {
            toast.push(
                <Notification type="success">
                    Recibirás en los próximos minutos el informe de servicios a
                    tu correo {session?.user.email}.
                </Notification>,
            )
        },
        onError: (error) => {
            toast.push(
                <Notification type="danger">
                    Hubo un error al generar el informe de servicios.{' '}
                    {error.message}
                </Notification>,
            )
        },
    })

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <ServicesListSearch onInputChange={handleInputChange} />
            <ServicesTableFilter
                clients={clients}
                faenas={faenas}
                status={statusValues}
            />
            {canExportReport && (
                <Button
                    icon={<TbCloudDownload className="text-xl" />}
                    onClick={() => exportMutation.mutate()}
                    loading={exportMutation.isPending}
                    disabled={exportMutation.isPending}
                >
                    {exportMutation.isPending
                        ? 'Exportando...'
                        : t('services.tools.exportButton')}
                </Button>
            )}
        </div>
    )
}

export default ServicesListTableTools
