'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import EditionCreationWizard from './ServiceEditionCreationWizard'
import { useEffect, useState } from 'react'
import ServiceEditionCreationBasicInformation from './ServiceEditionCreationBasicInformation'
import ServiceEditionCreationExtraInformation from './ServiceEditionCreationExtraInformation'
import ServiceEditionCreationContractAdmins from './ServiceEditionCreationContractAdmins'
import { Button, Notification, Skeleton, toast } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import ServiceEditionCreationPreview from './ServiceEditionCreationPreview'
import AssignedRolesCalendar from '../AssignedRolesCalendar'
import { IoArrowBack } from 'react-icons/io5'
import { useServicesStore } from '../../_store/servicesStore'
import { TDetailedService, TServiceRole } from '../../types'
import classNames from '@/utils/classNames'
import { useShallow } from 'zustand/react/shallow'
import { TbPencil, TbTrash } from 'react-icons/tb'
import SubContractTable from '../SubContractTable'
import ServiceManagersPreview from './ServiceEditionCreationManagerSubContractsPreview'
import { TbSparkles } from 'react-icons/tb'
import ServiceEditionCreationCreateWithAIModal from './ServiceEditionCreationCreateWithAIModal'
import ServiceEditionCreationRolesTable from './ServiceEditionCreationRolesTable'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serviceKeys } from '@/server/actions/services/service-keys'
import { getRolesByServiceId } from '@/server/actions/services/get-roles-by-service-id'
import { useParams, useRouter } from 'next/navigation'
import { getServiceById } from '@/server/actions/services/get-service-by-id'
import GenericConfirmationModal from '@/components/shared/GenericConfirmationModal'
import { createService } from '@/server/actions/services/create-service'
import { updateService } from '@/server/actions/services/update-service'
import { addRoleToService } from '@/server/actions/services/add-role-to-service'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'

const MAX_STEP = 2

const CreateEditServiceContent = () => {
    const { protectedQueryFn } = useProtectedQueryFn()
    const t = useTranslation()
    const router = useRouter()
    const params = useParams()
    const queryClient = useQueryClient()

    const [currentStep, setCurrentStep] = useState(0)
    const [createWithAI, setCreateWithAI] = useState(false)
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
    const { tempService, setTempService, roleToCreate, setRoleToCreate } =
        useServicesStore(
            useShallow((state) => ({
                tempService: state.tempService,
                setTempService: state.setTempService,
                roleToCreate: state.roleToCreate,
                setRoleToCreate: state.setRoleToCreate,
            })),
        )

    const serviceId = params?.slug ? String(params.slug) : ''
    const isEditing = Boolean(serviceId)

    const isSaveValid = (
        service: Partial<TDetailedService> | null,
    ): boolean => {
        if (!service) return false
        return Boolean(
            service.name?.trim() &&
            service.code?.trim() &&
            service.contractNumber?.trim() &&
            service.startDate &&
            service.endDate &&
            service.priority &&
            service.chore?.sk &&
            service.client?.sk &&
            service.division?.sk,
        )
    }

    const canSave = isSaveValid(tempService)

    const { isLoading: isLoadingService } = useQuery({
        queryKey: serviceKeys.serviceById(serviceId || ''),
        queryFn: async () => {
            const response = await getServiceById(serviceId)
            if (!response.success) {
                throw new Error(response.error)
            }
            setTempService(response.data as TDetailedService)
            return response.data
        },
        enabled: isEditing,
        staleTime: 1,
    })

    const { data: serviceRolesResponse, isLoading: isLoadingServiceRoles } =
        useQuery({
            queryKey: serviceKeys.rolesByServiceId(serviceId),
            queryFn: async () =>
                protectedQueryFn(() => getRolesByServiceId(serviceId)),
            enabled: isEditing,
        })

    const serviceRoles = serviceRolesResponse?.data

    const createMutation = useMutation({
        mutationFn: async (data: Partial<TDetailedService>) => {
            const response = await createService(data)
            if (!response.success) throw new Error(response.error)

            const roles = roleToCreate ?? []

            await Promise.all(
                roles.map(async (role) => {
                    const roleResponse = await addRoleToService(
                        role,
                        data?.code || serviceId,
                    )

                    if (!roleResponse.success) {
                        throw new Error(
                            roleResponse.error ||
                                `Error creando el rol ${role.roleName}`,
                        )
                    }
                }),
            )
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: serviceKeys.listServices(),
            })
            toast.push(
                <Notification
                    title={t('services.messages.createSuccess')}
                    type="success"
                />,
            )
            setRoleToCreate([])
            setTempService(null)
            router.push('/services')
        },
        onError: (error: Error) => {
            console.error(error)
            toast.push(
                <Notification
                    title={error.message || t('services.errors.createFailed')}
                    type="danger"
                />,
            )
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<TDetailedService>) => {
            if (!data.sk) throw new Error('Missing sk')
            const response = await updateService(data)
            if (!response.success) throw new Error(response.error)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: serviceKeys.serviceById(serviceId),
            })
            toast.push(
                <Notification
                    title={t('services.messages.updateSuccess')}
                    type="success"
                />,
            )
            router.push('/services')
        },
        onError: (error: Error) => {
            console.error(error)
            toast.push(
                <Notification
                    title={error.message || t('services.errors.updateFailed')}
                    type="danger"
                />,
            )
        },
    })

    const isPending = createMutation.isPending || updateMutation.isPending

    const buildPayload = (status: TDetailedService['status']) => ({
        ...tempService,
        code: tempService?.code || '',
        submanagers: tempService?.submanagers || [],
        managers: tempService?.managers || [],
        client: tempService?.client,
        parentId: tempService?.client?.sk,
        status,
    })

    const handlePublish = () => {
        const payload = buildPayload('publicado')
        if (isEditing) {
            updateMutation.mutate(payload)
        } else {
            createMutation.mutate(payload)
        }
    }

    const handleSaveDraft = () => {
        const payload = buildPayload('boceto')
        if (isEditing) {
            updateMutation.mutate(payload)
        } else {
            createMutation.mutate(payload)
        }
    }

    const handleDiscardConfirm = () => {
        setIsDiscardDialogOpen(false)
        setTempService(null)
        router.push('/services')
    }

    const handleValueChange = (
        prop: keyof TDetailedService,
        value: TDetailedService[keyof TDetailedService],
    ) => {
        setTempService({
            ...(tempService ?? {}),
            [prop]: value,
        } as TDetailedService)
    }

    const handleMultipleValueChange = (values: Partial<TDetailedService>) => {
        setTempService({
            ...(tempService ?? {}),
            ...values,
        } as TDetailedService)
    }

    useEffect(() => {
        return () => {
            // Clear temp service on unmount
            setTempService(null)
        }
    }, [setTempService])

    const stepContentGetter = (step: number) => {
        switch (step) {
            case 0:
                return isLoadingService ? (
                    <>
                        <Skeleton height={400} className="rounded-2xl" />
                        <Skeleton height={400} className="rounded-2xl" />
                    </>
                ) : (
                    <>
                        <AdaptiveCard>
                            <ServiceEditionCreationBasicInformation
                                service={tempService}
                                isEditing={isEditing}
                                onValueChange={handleValueChange}
                                onMultipleValueChange={
                                    handleMultipleValueChange
                                }
                            />
                        </AdaptiveCard>
                        <AdaptiveCard>
                            <ServiceEditionCreationExtraInformation
                                service={tempService}
                                onValueChange={handleValueChange}
                            />
                        </AdaptiveCard>
                    </>
                )
            case 1:
                return isLoadingService ? (
                    <>
                        <Skeleton height={200} className="rounded-2xl" />
                        <Skeleton height={200} className="rounded-2xl" />
                        <Skeleton height={300} className="rounded-2xl" />
                    </>
                ) : (
                    <>
                        <AdaptiveCard>
                            <ServiceEditionCreationContractAdmins
                                service={tempService}
                                onValueChange={handleValueChange}
                            />
                        </AdaptiveCard>
                        <AdaptiveCard>
                            <SubContractTable
                                data={tempService?.submanagers || []}
                                onValueChange={handleValueChange}
                            />
                        </AdaptiveCard>
                        {isEditing ? (
                            <AdaptiveCard>
                                <ServiceEditionCreationRolesTable
                                    isLoading={
                                        isLoadingServiceRoles ||
                                        isLoadingService
                                    }
                                    isEditing={isEditing}
                                    roles={
                                        isEditing
                                            ? [
                                                  ...(roleToCreate as TServiceRole[]),
                                                  ...serviceRoles!,
                                              ]
                                            : ((roleToCreate as TServiceRole[]) ??
                                              [])
                                    }
                                />
                            </AdaptiveCard>
                        ) : roleToCreate ? (
                            <AdaptiveCard>
                                <ServiceEditionCreationRolesTable
                                    isLoading={
                                        isLoadingServiceRoles ||
                                        isLoadingService
                                    }
                                    roles={roleToCreate as TServiceRole[]}
                                />
                            </AdaptiveCard>
                        ) : null}
                    </>
                )
            case 2:
                return isLoadingService ? (
                    <>
                        <Skeleton height={300} className="rounded-2xl" />
                        <Skeleton height={380} className="rounded-2xl" />
                        <Skeleton height={300} className="rounded-2xl" />
                    </>
                ) : (
                    <>
                        <ServiceEditionCreationPreview service={tempService} />
                        <ServiceManagersPreview
                            serviceData={
                                tempService
                                    ? {
                                          managers: tempService.managers,
                                          submanagers: tempService.submanagers,
                                      }
                                    : { managers: [], submanagers: [] }
                            }
                        />
                        <AdaptiveCard>
                            <h4 className="font-bold mb-2">
                                {t('services.details.assignedRoles')}
                            </h4>
                            <AssignedRolesCalendar data={serviceRoles || []} />
                        </AdaptiveCard>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <div className="relative flex flex-col min-h-screen gap-4 w-full mt-4">
            {currentStep === 0 ? (
                <Button
                    variant="solid"
                    onClick={() => setCreateWithAI(true)}
                    className="absolute top-0 right-0 transform -translate-y-14"
                >
                    <span className="flex items-center gap-2">
                        <TbSparkles /> {t('services.creation.createWithAI')}
                    </span>
                </Button>
            ) : null}
            <div className="grow">
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="flex flex-col gap-4 flex-4 xl:col-span-3">
                        {stepContentGetter(currentStep)}
                    </div>
                    <div className="flex flex-col gap-4 2xl:min-w-64">
                        <EditionCreationWizard currentStep={currentStep} />
                    </div>
                </div>
            </div>

            <div className="sticky bottom-12 left-0 bg-white dark:bg-gray-900 flex items-center justify-between py-4 px-8 border-t border-gray-200 z-40 -mx-4 lg:-mx-8 w-[calc(100%+2rem)] lg:w-[calc(100%+4rem)] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                {currentStep !== 0 ? (
                    <Button
                        disabled={isLoadingService || isPending}
                        variant="plain"
                        onClick={() => setCurrentStep(currentStep - 1)}
                    >
                        <p className="text-sm text-gray-600 flex items-center">
                            <IoArrowBack className="mr-2 h-4 w-4" />
                            {t('common.goBack')}
                        </p>
                    </Button>
                ) : (
                    <div />
                )}
                <div className="flex gap-2">
                    <Button
                        variant="default"
                        customColorClass={({ active }) =>
                            classNames(
                                'border-red-400 hover:text-red-600 dark:hover:bg-red-500 hover:ring-0',
                                active
                                    ? 'bg-red-50 text-red-500 border-red-500'
                                    : 'text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-500',
                            )
                        }
                        onClick={() => setIsDiscardDialogOpen(true)}
                        disabled={isPending}
                        icon={<TbTrash />}
                    >
                        {t('common.discard')}
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleSaveDraft}
                        disabled={isLoadingService || !canSave}
                        loading={isPending}
                        icon={<TbPencil />}
                    >
                        {t('common.saveDraft')}
                    </Button>
                    <Button
                        disabled={
                            isLoadingService ||
                            (currentStep === MAX_STEP && !canSave)
                        }
                        loading={isPending && currentStep === MAX_STEP}
                        variant="solid"
                        onClick={() => {
                            if (currentStep === MAX_STEP) {
                                handlePublish()
                            } else {
                                setCurrentStep(currentStep + 1)
                            }
                        }}
                    >
                        {currentStep === MAX_STEP
                            ? t('common.publish')
                            : t('common.next')}
                    </Button>
                </div>
            </div>
            <ServiceEditionCreationCreateWithAIModal
                open={createWithAI}
                onSuccess={(service: TDetailedService) =>
                    setTempService(service)
                }
                onClose={() => setCreateWithAI(false)}
            />
            <GenericConfirmationModal
                isOpen={isDiscardDialogOpen}
                onCancel={() => setIsDiscardDialogOpen(false)}
                onConfirm={handleDiscardConfirm}
                title={t('common.discardModal.title')}
                description={t('common.discardModal.permanentDiscard')}
                confirmButtonText={t('common.discard')}
                cancelButtonText={t('common.cancel')}
            />
        </div>
    )
}

export default CreateEditServiceContent
