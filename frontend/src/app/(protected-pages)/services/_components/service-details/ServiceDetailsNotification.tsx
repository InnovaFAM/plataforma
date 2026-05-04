'use client'
import { Alert, AlertProps } from '@/components/ui'

interface ServiceDetailsNotificationProps {
    title: string
    message: string
    alertType: AlertProps['type']
}

const ServiceDetailsNotification = ({
    title,
    message,
    alertType,
}: ServiceDetailsNotificationProps) => {
    return (
        <Alert className="w-full" showIcon type={alertType} title={title}>
            {message}
        </Alert>
    )
}

export default ServiceDetailsNotification
