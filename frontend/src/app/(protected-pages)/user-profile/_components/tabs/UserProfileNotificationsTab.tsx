'use client'

import Radio from '@/components/ui/Radio'
import Switcher from '@/components/ui/Switcher'
import useTranslation from '@/utils/hooks/useTranslation'
import { useState } from 'react'
import { TbMessageCircleCheck } from 'react-icons/tb'

const UserProfileNotificationsTab = () => {
    const t = useTranslation()
    const [emailNotficationChecked, setEmailNotificationChecked] =
        useState(false)
    const [vacationModeChecked, setVacationModeChecked] = useState(false)
    const [notifyMeOption, setNotifyMeOption] = useState('all')

    function handleNotifyMeChange(values: string): void {
        setNotifyMeOption(values)
    }

    const NOTIFY_ME_OPTIONS = [
        {
            value: 'all',
            label: t('userProfile.tabsCard.notificationsTab.generalNotifications.options.all'),
            desc: t('userProfile.tabsCard.notificationsTab.generalNotifications.options.allDescription'),
        },
        {
            value: 'roleBased',
            label: t('userProfile.tabsCard.notificationsTab.generalNotifications.options.roleBased'),
            desc: t('userProfile.tabsCard.notificationsTab.generalNotifications.options.roleBasedDescription'),
        },
        {
            value: 'none',
            label: t('userProfile.tabsCard.notificationsTab.generalNotifications.options.none'),
            desc: t('userProfile.tabsCard.notificationsTab.generalNotifications.options.noneDescription'),
        },
    ]

    return (
        <div>
            <div className="mt-2">
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>
                            {t(
                                'userProfile.tabsCard.notificationsTab.emailNotifications.title',
                            )}
                        </h5>
                        <p>
                            {t(
                                'userProfile.tabsCard.notificationsTab.emailNotifications.description',
                            )}
                        </p>
                    </div>
                    <div>
                        <Switcher
                            checked={emailNotficationChecked}
                            onChange={() =>
                                setEmailNotificationChecked((prev) => !prev)
                            }
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-600">
                    <div>
                        <h5>
                            {t(
                                'userProfile.tabsCard.notificationsTab.vacationsMode.title',
                            )}
                        </h5>
                        <p>
                            {t(
                                'userProfile.tabsCard.notificationsTab.vacationsMode.description',
                            )}
                        </p>
                    </div>
                    <div>
                        <Switcher
                            checked={vacationModeChecked}
                            onChange={() =>
                                setVacationModeChecked((prev) => !prev)
                            }
                        />
                    </div>
                </div>
                <div className="py-6 border-b border-gray-200 dark:border-gray-600">
                    <h5>{t('userProfile.tabsCard.notificationsTab.generalNotifications.title')}</h5>
                    <div className="mt-4">
                        <Radio.Group
                            vertical
                            className="flex flex-col gap-6"
                            value={notifyMeOption}
                            onChange={handleNotifyMeChange}
                        >
                            {NOTIFY_ME_OPTIONS.map((option) => (
                                <div key={option.value} className="flex gap-4">
                                    <div className="mt-1.5">
                                        <Radio value={option.value} />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="mt-1">
                                            <TbMessageCircleCheck className="text-lg" />
                                        </div>
                                        <div>
                                            <h6>{option.label}</h6>
                                            <p>{option.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Radio.Group>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default UserProfileNotificationsTab
