import ServicesListSearch from './ServicesListSearch'
import ServicesTableFilter from './ServicesTableFilter'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import Button from '@/components/ui/Button'
import { TbCloudDownload } from 'react-icons/tb'
import useTranslation from '@/utils/hooks/useTranslation'
import { TService } from '../types'

interface ServicesListTableToolsProps {
    services?: TService[]
}

const ServicesListTableTools = ({ services }: ServicesListTableToolsProps) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const t = useTranslation()
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

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <ServicesListSearch onInputChange={handleInputChange} />
            <ServicesTableFilter
                clients={clients}
                faenas={faenas}
                status={statusValues}
            />
            <Button icon={<TbCloudDownload className="text-xl" />}>
                {t('services.tools.exportButton')}
            </Button>
        </div>
    )
}

export default ServicesListTableTools
