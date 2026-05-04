'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

export function LoginSessionToast() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const session = searchParams.get('session')

        if (session === 'expired') {
            toast.push(
                <Notification title="Sesión terminada" type="warning">
                    Tu sesión ha terminado. Vuelve a iniciar sesión.
                </Notification>,
            )
        }
    }, [searchParams])

    return null
}
