'use client'

import { useQuery } from '@tanstack/react-query'

import UserProfileInfoCard from './UserProfileInfoCard'
import UserProfileTabsCard from './UserProfileTabsCard'
import {
    getUserProfileActivityLogs,
    userProfileDataKeys,
} from '@/server/actions/getUserProfileData'

const UserProfileContent = () => {
    const { data: userProfileActivityLogs = [] } = useQuery({
        queryKey: userProfileDataKeys.activityLogs,
        queryFn: getUserProfileActivityLogs,
    })

    return (
        <div className="relative flex flex-col gap-4 w-full mt-4">
            <div className="grow">
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="flex flex-col gap-4 flex-1 2xl:min-w-100">
                        <UserProfileInfoCard />
                    </div>
                    <div className="flex flex-col gap-4 flex-2 xl:col-span-3">
                        <UserProfileTabsCard userProfileActivityLogs={userProfileActivityLogs} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileContent
