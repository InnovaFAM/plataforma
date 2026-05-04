import { ReactNode } from 'react'
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query'

const Layout = async ({
    children,
}: {
    children: ReactNode
}) => {
    const queryClient = new QueryClient()

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    )
}

export default Layout
