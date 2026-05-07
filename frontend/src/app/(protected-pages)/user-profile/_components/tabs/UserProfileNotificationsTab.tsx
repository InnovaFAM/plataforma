import dayjs from 'dayjs'
import { Card } from '@/components/ui/Card'
import { TbLogin2, TbNotification } from 'react-icons/tb'
import { MdOutlinePayment } from 'react-icons/md'
import { PiTicketDuotone } from 'react-icons/pi'
import { LuBriefcase, LuTicketCheck } from 'react-icons/lu'
import { useQuery } from '@tanstack/react-query'
import { notificationsKeys } from '@/server/actions/users/users-keys'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { getUserNotifications } from '@/server/actions/users/activities-user'
import Spinner from '@/components/ui/Spinner'
import { TUserNotification } from '@/app/(protected-pages)/roles-users/types'

const UserProfileNotificationsTab: React.FC = () => {
    const { session } = useCurrentSession()
    const { data, error, isLoading } = useQuery({
        queryKey: notificationsKeys.list(),
        queryFn: async () => {
            const userId = session?.user.id || 'no user_id'
            const response = await getUserNotifications(userId)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data?.items
        },
    })

    const groupedByDate = data?.reduce(
        (acc, item) => {
            const date = dayjs(item.createdAt).format('YYYY-MM-DD')
            if (!acc[date]) {
                acc[date] = []
            }
            acc[date].push(item)
            return acc
        },
        {} as Record<string, typeof data extends Array<infer T> ? T[] : never>,
    )
    const TimeLineMedia = ({ type }: { type: string }) => {
        switch (type) {
            case 'login':
                return <TbLogin2 />
            case 'payment':
                return <MdOutlinePayment />
            case 'supportTicket':
                return <PiTicketDuotone />
            case 'supportTicketUpdate':
                return <LuTicketCheck />
            case 'ACTION#CREATE_CLIENT':
            case 'ACTION#UPDATE_CLIENT':
                return <LuBriefcase />
            case 'other':
                return <TbNotification />

            default:
                return <TbNotification />
        }
    }

    const TimeLineContent = ({
        notification,
    }: {
        notification: TUserNotification
    }) => {
        switch (notification.type) {
            case 'SERVICE_CONFIRMED':
                return (
                    <div>
                        <h6 className="font-bold">Servicio confirmado</h6>
                        <p className="font-semibold">
                            El servicio {notification.payload.serviceName} ha
                            sido confirmado correctamente
                        </p>
                    </div>
                )
            case 'SERVICE_PROPOSED':
                return (
                    <div>
                        <h6 className="font-bold">Nuevo servivio propuesto</h6>
                        <p className="font-semibold">
                            Se ha creado el servicio{' '}
                            {notification.payload.serviceName} en estado
                            propuesto.
                        </p>
                    </div>
                )
            case 'SERVICE_ROLE_COLLAB_PROPOSED':
                return (
                    <div>
                        <h6 className="font-bold">
                            Colaborador propuesto para un rol
                        </h6>
                        <p className="font-semibold">
                            El colaborador{' '}
                            {notification.payload.collaboratorName} fue asignado
                            como propuesto al rol{' '}
                            {notification.payload.roleName} del servicio{' '}
                            {notification.payload.serviceName}.
                        </p>
                    </div>
                )
            case 'SERVICE_TERMINATION_15':
                return (
                    <div>
                        <h6 className="font-bold">
                            Servicio próximo a terminar en 15 días
                        </h6>
                        <p className="font-semibold">
                            El servicio {notification.payload.serviceName}{' '}
                            finalizará en 15 días, con fecha de término{' '}
                            {notification.payload.endDate}.
                        </p>
                    </div>
                )
            case 'SERVICE_TERMINATION_10':
                return (
                    <div>
                        <h6 className="font-bold">
                            Servicio próximo a terminar en 10 días
                        </h6>
                        <p className="font-semibold">
                            El servicio {notification.payload.serviceName}{' '}
                            finalizará en 10 días, con fecha de término{' '}
                            {notification.payload.endDate}.
                        </p>
                    </div>
                )
            case 'SERVICE_TERMINATED':
                return (
                    <div>
                        <h6 className="font-bold">Servicio terminado</h6>
                        <p className="font-semibold">
                            El servicio {notification.payload.serviceName}{' '}
                            terminó el día {notification.payload.endDate}. Han
                            pasado {notification.payload.daysAfterTermination}{' '}
                            días desde su término.
                        </p>
                    </div>
                )
            case 'MAX_HH_SUPERATED':
                return (
                    <div>
                        <h6 className="font-bold">
                            Horas hombre máximas superadas
                        </h6>
                        <p className="font-semibold">
                            Se ha superado la cantidad máxima de horas hombre
                            para el mes {notification.payload.month}. HH máxima:{' '}
                            {notification.payload.maxHH}. HH actual:{' '}
                            {notification.payload.currentHH}.
                        </p>
                    </div>
                )
            case 'MAX_HH_SUPERATED':
                return (
                    <div>
                        <h6 className="font-bold">
                            Horas hombre máximas superadas
                        </h6>
                        <p className="font-semibold">
                            Se ha superado la cantidad máxima de horas hombre
                            para el mes {notification.payload.month}. HH máxima:{' '}
                            {notification.payload.maxHH}. HH actual:{' '}
                            {notification.payload.currentHH}.
                        </p>
                    </div>
                )
            case 'COLLAB_TERMINATION':
                return (
                    <div>
                        <h6 className="font-bold">Colaborador desvinculado</h6>
                        <p className="font-semibold">
                            El colaborador{' '}
                            {notification.payload.collaboratorName} ha sido
                            desvinculado de la empresa con fecha{' '}
                            {notification.payload.terminationDate}.
                        </p>
                    </div>
                )
            case 'CERTIFICATE_EXPIRATION':
                return (
                    <div>
                        <h6 className="font-bold">Certificado vencido</h6>
                        <p className="font-semibold">
                            El certificado{' '}
                            {notification.payload.certificateName} del
                            colaborador {notification.payload.collaboratorName}{' '}
                            vence el día {notification.payload.expirationDate}.
                        </p>
                    </div>
                )
            default:
                return (
                    <div>
                        <h6 className="font-bold">Notificación</h6>
                        <p className="font-semibold">Otra notificación</p>
                    </div>
                )
        }
    }

    if (isLoading) {
        return (
            <div className="flex w-full justify-center mt-4">
                <div className="flex gap-3 items-center">
                    <Spinner size="40px" />
                    Cargando Notificaciones...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <span className="flex w-full justify-center mt-4">
                Error al cargar las notificaciones - {error?.message || ''}
            </span>
        )
    }

    return (
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {groupedByDate &&
                Object.entries(groupedByDate).map(([date, items]) => (
                    <div key={date} className="mb-4">
                        <div className="mb-4 font-bold uppercase flex items-center gap-4">
                            <span className="w-17.5 heading-text">
                                {dayjs(date).format('DD MMMM')}
                            </span>
                            <div className="border-b border-2 border-gray-200 dark:border-gray-600 border-dashed w-full"></div>
                        </div>
                        <div className="flex flex-col gap-4">
                            {items.map((notification) => (
                                <div
                                    key={notification.createdAt}
                                    className="flex items-center"
                                >
                                    <span className="font-semibold w-25">
                                        {dayjs(notification.createdAt).format(
                                            'h:mm A',
                                        )}
                                    </span>
                                    <Card
                                        className="max-w-150 w-full"
                                        bodyClass="py-3"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-primary text-3xl">
                                                <TimeLineMedia
                                                    type={notification.type}
                                                />
                                            </div>
                                            <TimeLineContent
                                                notification={notification}
                                            />
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    )
}

export default UserProfileNotificationsTab
