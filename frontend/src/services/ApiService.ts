import AxiosBase from './axios/AxiosBase'
import { isAxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'

export type ServerResponse<T> = {
    success: boolean
    data?: T
    error?: string
    status?: number
    code?: 'SESSION_EXPIRED' | 'API_ERROR' | 'NETWORK_ERROR'
}

const ApiService = {
    async fetchDataWithAxios<T>(
        param: AxiosRequestConfig,
    ): Promise<ServerResponse<T>> {
        try {
            const response = await AxiosBase(param)
            return { success: true, data: response.data }
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (isAxiosError(error)) {
                const status = error.response?.status

                if (status === 401) {
                    return {
                        success: false,
                        error: 'Tu sesión ha terminado',
                        status: 401,
                        code: 'SESSION_EXPIRED',
                    }
                }

                const serverErrorMessage =
                    error.response?.data?.error?.message ||
                    error.response?.data?.message ||
                    error.message ||
                    'Unknown error'

                return {
                    success: false,
                    error: serverErrorMessage,
                    status,
                    code: 'API_ERROR',
                }
            }

            return {
                success: false,
                error: 'Unknown error',
                code: 'NETWORK_ERROR',
            }
        }
    },
}

export default ApiService
