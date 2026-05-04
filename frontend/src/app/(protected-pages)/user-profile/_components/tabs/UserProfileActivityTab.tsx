import dayjs from 'dayjs'
import { Card } from '@/components/ui/Card'
import { TbLogin2, TbLogs } from 'react-icons/tb'
import { MdOutlinePayment } from 'react-icons/md'
import { PiTicketDuotone } from 'react-icons/pi'
import { LuBriefcase, LuTicketCheck } from 'react-icons/lu'
import { useQuery } from '@tanstack/react-query'
import { activitiesKeys } from '@/server/actions/users/users-keys'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { getUserActivities } from '@/server/actions/users/activities-user'
import Spinner from '@/components/ui/Spinner'

const UserProfileActivityTab: React.FC = () => {
    const { session } = useCurrentSession()
    const { data, error, isLoading } = useQuery({
        queryKey: activitiesKeys.list(),
        queryFn: async () => {
            const userId = session?.user.id || 'no user_id'
            const response = await getUserActivities(userId)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data?.items
        },
    })

    const groupedByDate = data?.reduce(
        (acc, item) => {
            const date = dayjs(item.sk).format('YYYY-MM-DD')
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
            case 'create_client':
                return <LuBriefcase />
            case 'other':
                return <TbLogs />

            default:
                return <TbLogs />
        }
    }

    const TimeLineContent = (props: { type: string; description: string }) => {
        const { type, description } = props

        switch (type) {
            case 'create_client':
                return (
                    <div>
                        <h6 className="font-bold">Cliente Creado</h6>
                        <p className="font-semibold">{description}</p>
                    </div>
                )
            case 'update_client':
                return (
                    <div>
                        <h6 className="font-bold">Client Actualizado</h6>
                        <p className="font-semibold">{description}</p>
                    </div>
                )
            case 'supportTicket':
                return (
                    <div>
                        <h6 className="font-bold">Ticket de Soporte Creado</h6>
                        <p className="font-semibold">{description}</p>
                    </div>
                )
            case 'supportTicketUpdate':
                return (
                    <div>
                        <h6 className="font-bold">
                            Ticket de Soporte Actualizado
                        </h6>
                        <p className="font-semibold">{description}</p>
                    </div>
                )
            case 'other':
                return (
                    <div>
                        <h6 className="font-bold">Otra Actividad</h6>
                        <p className="font-semibold">{description}</p>
                    </div>
                )
            default:
                return (
                    <div>
                        <h6 className="font-bold">Actividad</h6>
                        <p className="font-semibold">{description}</p>
                    </div>
                )
        }
    }

    if (isLoading) {
        return (
            <div className="flex w-full justify-center mt-4">
                <div className="flex gap-3 items-center">
                    <Spinner size="40px" />
                    Cargando Actividades...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <span className="flex w-full justify-center mt-4">
                Error al cargar las actividades - {error?.message || ''}
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
                            {items.map((log) => {
                                // Determinar el tipo y descripción basado en la categoría
                                const category = log.category
                                let type = 'other'
                                let description = ''

                                if (category.includes('CREATE_CLIENT')) {
                                    type = 'create_client'
                                    description = `Cliente ${log.data.name} con rut ${log.data.rut} creado exitósamente.`
                                } else if (category.includes('UPDATE_CLIENT')) {
                                    type = 'update_client'
                                    description = `Cliente ${log.data.name} actualizado exitósamente.`
                                } else if (category.includes('PAYMENT')) {
                                    type = 'payment'
                                    description = 'Pago realizado'
                                } else if (
                                    category.includes('SUPPORT_TICKET')
                                ) {
                                    type = category.includes('UPDATE')
                                        ? 'supportTicketUpdate'
                                        : 'supportTicket'
                                    description = category.includes('UPDATE')
                                        ? 'Ticket actualizado'
                                        : 'Nuevo ticket creado'
                                }

                                return (
                                    <div
                                        key={log.sk}
                                        className="flex items-center"
                                    >
                                        <span className="font-semibold w-25">
                                            {dayjs(log.sk).format('h:mm A')}
                                        </span>
                                        <Card
                                            className="max-w-150 w-full"
                                            bodyClass="py-3"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-primary text-3xl">
                                                    <TimeLineMedia
                                                        type={type}
                                                    />
                                                </div>
                                                <TimeLineContent
                                                    type={type}
                                                    description={description}
                                                />
                                            </div>
                                        </Card>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
        </div>
    )
}

export default UserProfileActivityTab
