'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import type { ServerResponse } from '@/services/ApiService'

type NotificationType = 'success' | 'warning' | 'danger' | 'info'

function pushNotification({
    title,
    message,
    type = 'info',
}: {
    title: string
    message: string
    type?: NotificationType
}) {
    toast.push(
        <Notification title={title} type={type}>
            {message}
        </Notification>,
    )
}

export function useApiResponseHandler() {
    const router = useRouter()

    const handleResponse = async <T,>(
        response: ServerResponse<T>,
    ): Promise<ServerResponse<T> | null> => {
        if (response.success) {
            return response
        }

        if (response.code === 'SESSION_EXPIRED' || response.status === 401) {
            pushNotification({
                title: 'Sesión terminada',
                message: 'Tu sesión ha terminado. Vuelve a iniciar sesión.',
                type: 'warning',
            })

            await signOut({
                redirect: false,
            })

            router.replace('/sign-in?session=expired')

            return null
        }

        pushNotification({
            title: 'Error',
            message: response.error || 'Ocurrió un error inesperado',
            type: 'danger',
        })

        return null
    }

    return {
        handleResponse,
    }
}
