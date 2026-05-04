import { UserProfileData } from '@/app/(protected-pages)/user-profile/types'
import { userProfileActivityLogs } from '@/mock/data/userProfileData'

export const getUserProfileActivityLogs = async (): Promise<
    UserProfileData['activityLogs']
> => {
    return userProfileActivityLogs
}

export const userProfileDataKeys = {
    activityLogs: ['userProfileActivityLogs'] as const,
}
