'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useState } from 'react'
import ServiceDetailsBasicInformation from './ServiceDetailsBasicInformation'
import ServiceDetailsContractPayroll from './ServiceDetailsContractPayroll'
import { useQuery } from '@tanstack/react-query'
import ServiceEditionCreationContractAdmins from '../edition-creation/ServiceEditionCreationContractAdmins'
import SubContractTable from '../SubContractTable'
import ServiceDetailsRoleAssignment from './ServiceDetailsRoleAssignment'
import { Dialog } from '@/components/ui'
import { getServiceById } from '@/server/actions/services/get-service-by-id'
import { serviceKeys } from '@/server/actions/services/service-keys'
import { getRolesByServiceId } from '@/server/actions/services/get-roles-by-service-id'
import ModalEditionCreationRoles from '../edition-creation/ModalEditionCreationRoles'
import { useServicesStore } from '../../_store/servicesStore'

interface ServiceDetailsContentProps {
    serviceId: string
}

const ServiceDetailsContent = ({ serviceId }: ServiceDetailsContentProps) => {
    const { data: service, isLoading: isLoadingService } = useQuery({
        queryKey: serviceKeys.serviceById(serviceId),
        queryFn: async () => {
            const response = await getServiceById(serviceId)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
    })

    const { data: serviceRoles, isLoading: isLoadingServiceRoles } = useQuery({
        queryKey: serviceKeys.rolesByServiceId(serviceId),
        queryFn: async () => {
            const response = await getRolesByServiceId(serviceId)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
    })

    const setTempService = useServicesStore((state) => state.setTempService)
    const [roleDisplayed, setRoleDisplayed] = useState<string>('')
    const [roleToAdd, setRoleToAdd] = useState<boolean>(false)

    return (
        <div className="flex flex-col gap-4 max-w-full overflow-x-hidden my-4">
            {/* TODO: mocked notification */}
            {/**
           * <ServiceDetailsNotification
               title="ATENCIÓN"
               message="Este servicio está en estado de alerta."
               alertType="danger"
           />
           */}
            <AdaptiveCard>
                <ServiceDetailsBasicInformation
                    service={service}
                    isLoading={isLoadingService}
                />
            </AdaptiveCard>
            <AdaptiveCard collapsible>
                <ServiceEditionCreationContractAdmins
                    service={service}
                    isLoading={isLoadingService}
                    isDetailsView
                />
            </AdaptiveCard>
            <AdaptiveCard collapsible>
                <SubContractTable
                    data={service?.submanagers || []}
                    isLoading={isLoadingService}
                />
            </AdaptiveCard>
            <AdaptiveCard collapsible>
                <ServiceDetailsContractPayroll
                    roles={serviceRoles || []}
                    onAddRole={() => {
                        setTempService(service!)
                        setRoleToAdd(true)
                    }}
                    isLoading={isLoadingServiceRoles}
                    onRoleClick={(roleName) => setRoleDisplayed(roleName)}
                />
            </AdaptiveCard>
            <Dialog
                className="min-w-[90vw]"
                contentClassName="overflow-auto max-h-[90vh]"
                isOpen={!!roleDisplayed}
                onClose={() => setRoleDisplayed('')}
                onRequestClose={() => setRoleDisplayed('')}
            >
                <ServiceDetailsRoleAssignment
                    selectedRole={serviceRoles?.find(
                        (role) => role.roleName === roleDisplayed,
                    )}
                />
            </Dialog>
            <ModalEditionCreationRoles
                onClose={() => setRoleToAdd(false)}
                roles={
                    serviceRoles?.filter(
                        (role) => role.roleName === roleDisplayed,
                    ) || []
                }
                isOpen={roleToAdd}
                temporalRole={null}
            />
        </div>
    )
}

export default ServiceDetailsContent
