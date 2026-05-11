'use client'
import { useQuery } from '@tanstack/react-query'
import HomeContent from './_components/HomeContent'
import { homeKeys } from '@/server/actions/analytics/analytics-keys'
import { getHome } from '@/server/actions/analytics/home-actions'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import HomeContentSkeleton from './_components/HomeContentSkeleton'

const Page = () => {
    const { protectedQueryFn } = useProtectedQueryFn()
    const { data, isLoading, error } = useQuery({
        queryKey: homeKeys.all,
        queryFn: () => protectedQueryFn(() => getHome()),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    if (error) {
        return <>Error al cargar la página inicial - {error}</>
    }
    return (
        <>
            {isLoading ? (
                <HomeContentSkeleton />
            ) : (
                <HomeContent data={data?.data} />
            )}
        </>
    )
}

export default Page
