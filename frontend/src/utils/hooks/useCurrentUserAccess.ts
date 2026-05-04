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
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
    })
}
