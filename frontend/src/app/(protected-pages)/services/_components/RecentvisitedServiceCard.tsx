import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import { TService } from '../types'
import { TbClipboardCheck } from 'react-icons/tb'
import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import getServiceProgression from '../_utils/getServiceProgression'
import ProgressionBar from './ProgressionBar'
import { Card } from '@/components/ui'
import Link from 'next/link'
import useTranslation from '@/utils/hooks/useTranslation'

interface RecentVisitedServiceCardProps {
    service: TService
}

const RecentVisitedServiceCard = ({
    service,
}: RecentVisitedServiceCardProps) => {
    const t = useTranslation()
    return (
        <Card key={service.sk} bodyClass="h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between items-center">
                    <Link href={`/services/${encodeURIComponent(service.sk)}`}>
                        <h6 className="font-bold hover:text-primary">
                            {service.name}
                        </h6>
                    </Link>
                </div>
                <p className="mt-2 line-clamp-2 text-ellipsis overflow-hidden">
                    {t('services.common.client')}: {service.client?.name || '-'}
                </p>
                <div className="mt-3">
                    <ProgressionBar
                        progression={getServiceProgression(
                            service.startDate,
                            service.endDate,
                        )}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <UsersAvatarGroup users={service.managers || []} />
                        <div className="flex items-center rounded-full font-semibold text-xs">
                            <div className="flex items-center px-2 py-1 border border-gray-300 rounded-full">
                                <TbClipboardCheck className="text-base" />
                                <span className="ml-1 rtl:mr-1 whitespace-nowrap">
                                    <>{getDayJsDate(service.endDate)}</>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default RecentVisitedServiceCard
