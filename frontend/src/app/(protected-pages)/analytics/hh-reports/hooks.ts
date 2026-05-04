import { useQuery } from '@tanstack/react-query'
import { HHDetailParams, HHProjectionParams } from './types'
import {
    hhDetailKeys,
    hhProjectionKeys,
} from '@/server/actions/analytics/analytics-keys'
import { getHHProjectionClient } from './_clients/getHHProjectionClient'
import { getHHDetailClient } from './_clients/getHHDetailClient'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'

export const useHHProjection = (params: HHProjectionParams) => {
    const { protectedQueryFn } = useProtectedQueryFn()
    return useQuery({
        queryKey: hhProjectionKeys.list(params),
        queryFn: () => protectedQueryFn(() => getHHProjectionClient(params)),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })
}

export const useHHDetail = (params: HHDetailParams) => {
    const { protectedQueryFn } = useProtectedQueryFn()
    return useQuery({
        queryKey: hhDetailKeys.list(params),
        queryFn: () => protectedQueryFn(() => getHHDetailClient(params)),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })
}
