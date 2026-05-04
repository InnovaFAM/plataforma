export type ActivityLog = {
    id: string
    date: number
    events: {
        type: string
        dateTime: number
        description: string
    }[]
}

export type UserProfileData = {
    activityLogs: ActivityLog[]
}
