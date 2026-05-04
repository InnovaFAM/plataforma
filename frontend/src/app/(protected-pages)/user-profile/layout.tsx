import { ReactNode } from 'react'
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query'

import {
    getUserProfileActivityLogs,
    userProfileDataKeys,
} from '@/server/actions/getUserProfileData'

const Layout = async ({ children }: { children: ReactNode }) => {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: userProfileDataKeys.activityLogs,
        queryFn: getUserProfileActivityLogs,
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    )
}

export default Layout
