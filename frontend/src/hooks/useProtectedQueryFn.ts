'use client'

import { useApiResponseHandler } from '@/hooks/useApiResponseHandler'
import type { ServerResponse } from '@/services/ApiService'

export function useProtectedQueryFn() {
    const { handleResponse } = useApiResponseHandler()

    const protectedQueryFn = async <T>(
        callback: () => Promise<ServerResponse<T>>,
    ): Promise<ServerResponse<T>> => {
        const response = await callback()

        const data = await handleResponse(response)

        if (!data) {
            throw new Error('REQUEST_FAILED')
        }
        return data
    }

    return {
        protectedQueryFn,
    }
}
