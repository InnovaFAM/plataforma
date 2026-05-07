'use client'

import { useQuery } from '@tanstack/react-query'
import { useApiResponseHandler } from '@/hooks/useApiResponseHandler'
import { getByID } from '@/server/actions/users/list-users'
import useCurrentSession from './useCurrentSession'

export function useCurrentUserAccess() {
    const { session } = useCurrentSession()
    const { handleResponse } = useApiResponseHandler()

    return useQuery({
        queryKey: ['current-user-access'],
        queryFn: async () => {
            const response = await getByID(session?.user.id || '')

            const data = await handleResponse(response)

            if (!data) {
                throw new Error('USER_ACCESS_NOT_FOUND')
            }

            return data
        },
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        retry: false,
    })
}
