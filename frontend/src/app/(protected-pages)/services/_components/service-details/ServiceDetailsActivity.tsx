'use client'

import classNames from '@/utils/classNames'
import Timeline from '@/components/ui/Timeline'
import Badge from '@/components/ui/Badge'
import Tag from '@/components/ui/Tag'
import isLastChild from '@/utils/isLastChild'
import dayjs from 'dayjs'
import { Activities } from '../../types'
import useTranslation from '@/utils/hooks/useTranslation'
import 'dayjs/locale/es'

type ServiceDetailsActivitiesProps = {
    activities: Activities
    progressStatus: number
}



const ServiceDetailsActivities = ({
    activities,
    progressStatus,
}: ServiceDetailsActivitiesProps) => {
    const t = useTranslation()
    const progress: Record<number, { label: string; class: string }> = {
    0: {
        label: t('services.details.activityStatus.fulfilled'),
        class: 'bg-success-subtle text-success',
    },
    1: {
        label: t('services.details.activityStatus.unfulfilled'),
        class: 'bg-error-subtle text-error',
    },
}
    return (
        <div className='max-h-120 overflow-auto'>
            <div className="flex items-center gap-2 mb-4">
                <h5>{t('services.details.activity')}</h5>
                <Tag
                    className={classNames(
                        'border-0 rounded-md',
                        progress[progressStatus || 0].class,
                    )}
                >
                    {progress[progressStatus || 0].label}
                </Tag>
            </div>
            {activities.map((activity, i) => (
                <div
                    key={activity.date}
                    className={!isLastChild(activities, i) ? 'mb-8' : ''}
                >
                    <div className="mb-2 font-bold heading-text uppercase">
                        {dayjs.unix(activity.date).locale('es').format('dddd, DD MMMM')}
                    </div>
                    <Timeline>
                        {activity.events.map((event, j) => (
                            <Timeline.Item
                                key={event.time + j}
                                media={
                                    <div className="flex mt-1">
                                        <Badge
                                            innerClass={classNames(
                                                event.recipient
                                                    ? 'bg-emerald-500'
                                                    : 'bg-blue-500',
                                            )}
                                        />
                                    </div>
                                }
                            >
                                <div
                                    className={classNames(
                                        'font-bold mb-1 heading-text',
                                        event.recipient && 'text-emerald-500',
                                    )}
                                >
                                    {event.action}
                                </div>
                                {event.recipient && (
                                    <div className="mb-1">
                                        {t('services.details.activityBox.recipient')} {event.recipient}
                                    </div>
                                )}
                                <div>
                                    {dayjs.unix(event.time).format('hh:mm A')}
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </div>
            ))}
        </div>
    )
}

export default ServiceDetailsActivities
