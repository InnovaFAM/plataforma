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
import { TUserActivity } from '@/app/(protected-pages)/roles-users/types'
import { TClient } from '@/app/(protected-pages)/services/types'
import Link from 'next/link'

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
            case 'ACTION#CREATE_CLIENT':
            case 'ACTION#UPDATE_CLIENT':
                return <LuBriefcase />
            case 'other':
                return <TbLogs />

            default:
                return <TbLogs />
        }
    }

    const TimeLineContent = ({ log }: { log: TUserActivity }) => {
        switch (log.category) {
            case 'ACTION#CREATE_CLIENT':
                const data = log.data as TClient
                return (
                    <div>
                        <h6 className="font-bold">Cliente Creado</h6>
                        <p className="font-semibold">
                            Cliente {data.name} creado exitosamente
                        </p>
                    </div>
                )
            case 'ACTION#UPDATE_CLIENT':
                const client = log.data as TClient
                return (
                    <div>
                        <h6 className="font-bold">Client Actualizado</h6>
                        <p className="font-semibold">
                            Cliente {client.name} actualizado exitosamente
                        </p>
                    </div>
                )
            case 'ACTION#UPDATE_SRV_ROLE':
                return (
                    <div>
                        <h6 className="font-bold">Role Actualizado</h6>
                        <p className="font-semibold">
                            Se ha actualizado el role <b>{log.data.roleName}</b>{' '}
                            en el servicio{' '}
                            <Link
                                className="hover:text-primary"
                                target="_blank"
                                href={`/services/${log.data.service_code}`}
                            >
                                {log.data.service_code}
                            </Link>
                        </p>
                    </div>
                )
            case 'ACTION#CREATE_SRV_ROLE':
                const roleService = log.data
                return (
                    <div>
                        <h6 className="font-bold">Role Creado</h6>
                        <p className="font-semibold">
                            Se ha creado el role <b>{roleService.roleName}</b>{' '}
                            en el servicio{' '}
                            <Link
                                className="hover:text-primary"
                                target="_blank"
                                href={`/services/${roleService.service_code}`}
                            >
                                {roleService.service_code}
                            </Link>
                        </p>
                    </div>
                )
            case 'ACTION#ASSIGN_SRV_COLLAB':
                return (
                    <div>
                        <h6 className="font-bold">Colaborador Asignado</h6>
                        <p className="font-semibold">
                            Se ha asignado el colaborador{' '}
                            <b>{log.data.collab.name}</b> para el role{' '}
                            <b>{log.data.roleName}</b> en el servicio{' '}
                            <Link
                                className="hover:text-primary"
                                target="_blank"
                                href={`/services/${log.data.serviceCode}`}
                            >
                                {log.data.serviceCode}
                            </Link>
                        </p>
                    </div>
                )
            case 'ACTION#UNASSIGN_SRV_COLLAB':
                return (
                    <div>
                        <h6 className="font-bold">Colaborador Desasignado</h6>
                        <p className="font-semibold">
                            Se ha Desasignado el colaborador{' '}
                            <b>{log.data.collab.name}</b> para el role{' '}
                            <b>{log.data.roleName}</b> en el servicio{' '}
                            <Link
                                className="hover:text-primary"
                                target="_blank"
                                href={`/services/${log.data.serviceCode}`}
                            >
                                {log.data.serviceCode}
                            </Link>
                        </p>
                    </div>
                )
            case 'ACTION#UPDATE_SRV_COLLAB':
                return (
                    <div>
                        <h6 className="font-bold">Asignación Actualizada</h6>
                        <p className="font-semibold">
                            Se ha actualizado la asignación del colaborador{' '}
                            <b>{log.data.collab.name}</b> para el role{' '}
                            <b>{log.data.roleName}</b> en el servicio{' '}
                            <b>
                                <Link
                                    className="hover:text-primary"
                                    target="_blank"
                                    href={`/services/${log.data.serviceCode}`}
                                >
                                    {log.data.serviceCode}
                                </Link>
                            </b>
                        </p>
                    </div>
                )
            default:
                return (
                    <div>
                        <h6 className="font-bold">Actividad</h6>
                        <p className="font-semibold">Otra actividad</p>
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
                            {items.map((log) => (
                                <div key={log.sk} className="flex items-center">
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
                                                    type={log.category}
                                                />
                                            </div>
                                            <TimeLineContent log={log} />
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

export default UserProfileActivityTab
