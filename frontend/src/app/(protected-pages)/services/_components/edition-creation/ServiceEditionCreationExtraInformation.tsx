import { Notification, Select, toast } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TChore, TClient, TDetailedService, TDivision } from '../../types'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import { useQuery } from '@tanstack/react-query'
import { listBackOfficeClients } from '@/server/actions/backoffice/list-clients'
import { listBackOfficeChores } from '@/server/actions/backoffice/list-chores'
import { listBackOfficeDivisions } from '@/server/actions/backoffice/list-divisions'
import { useEffect } from 'react'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'

interface ServiceEditionCreationExtraInformationProps {
    service?: TDetailedService | null
    onValueChange?: (
        prop: keyof TDetailedService,
        value: TDetailedService[keyof TDetailedService],
    ) => void
}

const ServiceEditionCreationExtraInformation = ({
    service,
    onValueChange,
}: ServiceEditionCreationExtraInformationProps) => {
    const { protectedQueryFn } = useProtectedQueryFn()
    const t = useTranslation()
    const priorityOptions = [
        { label: t('services.priority.high'), value: 'alta' },
        { label: t('services.priority.medium'), value: 'media' },
        { label: t('services.priority.low'), value: 'baja' },
    ]

    const {
        data: clientsResponse,
        isLoading: isLoadingClients,
        isError: isErrorClients,
    } = useQuery({
        queryKey: backOfficeKeys.clients,
        queryFn: async () =>
            protectedQueryFn(() => listBackOfficeClients(undefined, 500)),
    })
    const clients = clientsResponse?.data

    const {
        data: chores,
        isLoading: isLoadingChores,
        isError: isErrorChores,
    } = useQuery({
        queryKey: backOfficeKeys.chores,
        queryFn: async () => {
            const response = await listBackOfficeChores(undefined, 500)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
    })

    const {
        data: divisions,
        isLoading: isLoadingDivisions,
        isError: isErrorDivisions,
    } = useQuery({
        queryKey: backOfficeKeys.divisions,
        queryFn: async () => {
            const response = await listBackOfficeDivisions(undefined, 500)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
    })

    useEffect(() => {
        if (service && isErrorClients) {
            toast.push(
                <Notification
                    type="danger"
                    title={t('backOffice.errors.fetchClients')}
                />,
            )
        }
    }, [service, isErrorClients, t])

    useEffect(() => {
        if (service && isErrorChores) {
            toast.push(
                <Notification
                    type="danger"
                    title={t('backOffice.errors.fetchChores')}
                />,
            )
        }
    }, [service, isErrorChores, t])

    useEffect(() => {
        if (service && isErrorDivisions) {
            toast.push(
                <Notification
                    type="danger"
                    title={t('backOffice.errors.fetchDivisions')}
                />,
            )
        }
    }, [service, isErrorDivisions, t])

    const getClientName = (clientId: string | null) => {
        if (!clientId) return null

        const selectedClient = clients?.items.find(
            (client) => client.sk === clientId,
        )

        return {
            label: selectedClient?.name || '',
            value: selectedClient?.sk || '',
        }
    }

    return (
        <div className="flex flex-col gap-4 pb-4">
            <h4 className="font-bold mb-4">
                {t('services.creation.extraInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-4">
                    <label className="text-sm font-bold">
                        {t('services.common.client')}
                        <Select
                            className="mt-2"
                            instanceId="load-option-on-expand"
                            isLoading={isLoadingClients}
                            menuPlacement="top"
                            maxMenuHeight={300}
                            loadingMessage={() => t('services.common.loading')}
                            placeholder={t('services.common.selectPlaceholder')}
                            options={clients?.items?.map((client) => ({
                                label: client.name,
                                value: client.sk,
                            }))}
                            value={
                                service?.client?.sk
                                    ? {
                                          label: service?.client?.name || '',
                                          value: service?.client?.sk || '',
                                      }
                                    : null
                            }
                            onChange={(option) =>
                                onValueChange?.('client', {
                                    ...(clients?.items?.find(
                                        (client) => client.sk === option?.value,
                                    ) as TClient),
                                })
                            }
                        />
                    </label>
                    <label className="text-sm font-bold mt-4">
                        {t('services.common.faena')}
                        <Select
                            isLoading={isLoadingChores}
                            loadingMessage={() => t('services.common.loading')}
                            className="mt-2"
                            menuPlacement="top"
                            maxMenuHeight={300}
                            instanceId="load-option-on-expand-2"
                            placeholder={t('services.common.selectPlaceholder')}
                            options={chores?.items?.map((chore) => ({
                                label: chore.name,
                                value: chore.sk,
                            }))}
                            value={
                                service?.chore?.sk
                                    ? {
                                          label: service?.chore?.name || '',
                                          value: service?.chore?.sk || '',
                                      }
                                    : null
                            }
                            onChange={(option) =>
                                onValueChange?.('chore', {
                                    ...(chores?.items?.find(
                                        (chore) => chore.sk === option?.value,
                                    ) as TChore),
                                })
                            }
                        />
                    </label>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <label className="text-sm font-bold">
                        {t('services.common.priority')}
                        <Select
                            className="mt-2"
                            instanceId="priority-select"
                            placeholder={t('services.common.selectPlaceholder')}
                            options={priorityOptions}
                            menuPlacement="top"
                            maxMenuHeight={300}
                            value={
                                service?.priority
                                    ? priorityOptions.find(
                                          (option) =>
                                              option.value ===
                                              service?.priority,
                                      ) || null
                                    : null
                            }
                            onChange={(option) =>
                                onValueChange?.(
                                    'priority',
                                    option?.value as TDetailedService['priority'],
                                )
                            }
                        />
                    </label>
                    <label className="text-sm font-bold mt-4">
                        {t('services.common.division')}
                        <Select
                            className="mt-2"
                            instanceId="division-select"
                            isLoading={isLoadingDivisions}
                            menuPlacement="top"
                            maxMenuHeight={300}
                            loadingMessage={() => t('services.common.loading')}
                            placeholder={t('services.common.selectPlaceholder')}
                            options={divisions?.items?.map((division) => ({
                                label: division.name,
                                value: division.sk,
                            }))}
                            value={
                                service?.division?.sk
                                    ? {
                                          label: service?.division?.name || '',
                                          value: service?.division?.sk || '',
                                      }
                                    : null
                            }
                            onChange={(option) =>
                                onValueChange?.('division', {
                                    ...(divisions?.items?.find(
                                        (division) =>
                                            division.sk === option?.value,
                                    ) as TDivision),
                                })
                            }
                        />
                    </label>
                </div>
            </div>
        </div>
    )
}

export default ServiceEditionCreationExtraInformation
