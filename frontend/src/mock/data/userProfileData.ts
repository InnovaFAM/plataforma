import { UserProfileData } from '@/app/(protected-pages)/user-profile/types'

export const userProfileActivityLogs: UserProfileData['activityLogs'] = [
    {
        id: '1',
        date: new Date('2025-06-01').getTime(),
        events: [
            {
                type: 'login',
                dateTime: new Date('2025-06-01T10:15:00').getTime(),
                description: 'Has iniciado sesión desde un nuevo dispositivo.',
            },
            {
                type: 'other',
                dateTime: new Date('2025-06-01T14:30:00').getTime(),
                description: 'Has cambiado tu contraseña exitosamente.',
            },
            {
                type: 'payment',
                dateTime: new Date('2025-06-01T09:45:00').getTime(),
                description:
                    'Has realizado un pago de $49.99 para la suscripción mensual.',
            },
        ],
    },
    {
        id: '2',
        date: new Date('2025-06-18').getTime(),
        events: [
            {
                type: 'supportTicket',
                dateTime: new Date('2025-06-18T16:20:00').getTime(),
                description:
                    'Has creado un ticket de soporte con el ID #12345.',
            },
        ],
    },
    {
        id: '3',
        date: new Date('2025-06-19').getTime(),
        events: [
            {
                type: 'supportTicketUpdate',
                dateTime: new Date('2025-06-19T11:00:00').getTime(),
                description:
                    'Tu ticket de soporte #12345 ha sido actualizado por el equipo de soporte.',
            },
        ],
    },
    {
        id: '4',
        date: new Date('2025-06-23').getTime(),
        events: [
            {
                type: 'login',
                dateTime: new Date('2025-06-23T08:00:00').getTime(),
                description:
                    'Has iniciado sesión desde tu dispositivo habitual.',
            },
            {
                type: 'other',
                dateTime: new Date('2025-06-23T12:00:00').getTime(),
                description:
                    'Intentaste cambiar tu contraseña pero no se completó.',
            },
        ],
    },
    {
        id: '5',
        date: new Date('2025-07-05').getTime(),
        events: [
            {
                type: 'payment',
                dateTime: new Date('2025-07-05T14:00:00').getTime(),
                description:
                    'Tu intento de pago de $49.99 ha fallado debido a fondos insuficientes.',
            },
        ],
    },
    {
        id: '6',
        date: new Date('2025-07-20').getTime(),
        events: [
            {
                type: 'supportTicketUpdate',
                dateTime: new Date('2025-07-20T10:00:00').getTime(),
                description:
                    'Tu ticket de soporte #12345 ha sido cerrado por el equipo de soporte.',
            },
        ],
    },
    {
        id: '7',
        date: new Date('2025-07-25').getTime(),
        events: [
            {
                type: 'other',
                dateTime: new Date('2025-07-25T09:30:00').getTime(),
                description:
                    'Has cambiado tu plan de suscripción a Premium.',
            },
            {
                type: 'payment',
                dateTime: new Date('2025-07-25T10:00:00').getTime(),
                description:
                    'Has realizado un pago de $99.99 para la suscripción anual.',
            },
        ],
    },
]