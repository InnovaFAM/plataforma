import AdaptiveCard from '@/components/shared/AdaptiveCard'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import Tabs from '@/components/ui/Tabs/Tabs'
import useTranslation from '@/utils/hooks/useTranslation'
import UserProfileSecurityTab from './tabs/UserProfileSecurityTab'
import UserProfileActivityTab from './tabs/UserProfileActivityTab'
import UserProfileNotificationsTab from './tabs/UserProfileNotificationsTab'
import { ActivityLog } from '../types'

export type UserProfileTabsCardProps = {
    userProfileActivityLogs: ActivityLog[]
}

const UserProfileTabsCard: React.FC<UserProfileTabsCardProps> = () => {
    const t = useTranslation()
    return (
        <AdaptiveCard>
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">
                        {t('userProfile.tabsCard.security')}
                    </TabNav>
                    <TabNav value="tab2">
                        {t('userProfile.tabsCard.activity')}
                    </TabNav>
                    <TabNav value="tab3">
                        {t('userProfile.tabsCard.notifications')}
                    </TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                        <UserProfileSecurityTab />
                    </TabContent>
                    <TabContent value="tab2">
                        <UserProfileActivityTab />
                    </TabContent>
                    <TabContent value="tab3">
                        <UserProfileNotificationsTab />
                    </TabContent>
                </div>
            </Tabs>
        </AdaptiveCard>
    )
}

export default UserProfileTabsCard
