import ServiceDetailsRoleAssignmentSearch from './ServiceDetailsRoleAssignmentSearch'
import useTranslation from '@/utils/hooks/useTranslation'
import { useServicesStore } from '../../_store/servicesStore'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import { listCollaborators } from '@/server/actions/collaborators/list-collaborators'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { collaboratorsKeys } from '@/server/actions/collaborators/collaborator-keys'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { ControlProps, OptionProps } from 'react-select'
import { components } from 'react-select'
import { Avatar, toast, Notification, Button } from '@/components/ui'
import { TServiceRole } from '../../types'
import { TCollabsByRole } from '@/app/(protected-pages)/collaborators/types'
import { getCollabByRole } from '@/server/actions/collaborators/get-collabs-by-role'
import { FullResponse } from '@/@types'
import { useCollabsByRole } from '@/hooks/useCollabsByRole'

const statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'Disponible', value: 'disponible' },
    { label: 'No Disponible', value: 'no disponible' },
    { label: 'Propuesto', value: 'propuesto' },
]

const annexOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Con anexo', value: 'true' },
    { label: 'Sin anexo', value: 'false' },
]

const complianceOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Con Cumplimiento', value: 'true' },
    { label: 'Sin Cumplimiento', value: 'false' },
]

const evaluationOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Con Evaluación', value: 'true' },
    { label: 'Sin Evaluación', value: 'false' },
]

type TProps = {
    selectedRole?: TServiceRole
    setIsAddingCollab: React.Dispatch<React.SetStateAction<boolean>>
}

type Option = {
    label: string
    value: string
    position: string
    pictureUrl?: string
}

const { Control } = components

const CustomSelectOption = (props: OptionProps<Option>) => {
    return (
        <DefaultOption<Option>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Avatar shape="circle" size={20} src={data.pictureUrl} />
                    <div className="flex flex-col">
                        <span className="ml-2">{label}</span>
                        <span
                            className="ml-2 font-medium"
                            style={{ fontSize: 12 }}
                        >
                            {data.position}
                        </span>
                    </div>
                </span>
            )}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<Option>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={18}
                    src={selected.pictureUrl}
                />
            )}
            {children}
        </Control>
    )
}

const ServiceDetailsRoleAssignmentTableTools: React.FC<TProps> = ({
    selectedRole,
    setIsAddingCollab,
}) => {
    const t = useTranslation()
    const queryClient = useQueryClient()
    const { protectedQueryFn } = useProtectedQueryFn()

    const {
        roleAssignmentFilterData,
        setRoleAssignmentFilterData,
        setRoleAssignmentSearchValue,
    } = useServicesStore()

    const handleInputChange = (query: string) => {
        setRoleAssignmentSearchValue(query)
    }

    const { data: usersList, isLoading: isLoadingCollabsByRole } =
        useCollabsByRole(selectedRole)

    const { data: collaboratorsList, isLoading: isLoadingCollaborators } =
        useQuery({
            queryKey: collaboratorsKeys.all,
            queryFn: () => protectedQueryFn(() => listCollaborators()),
        })

    const handleResetFilters = () => {
        setRoleAssignmentFilterData({
            annexes: 'all',
            compliance: 'all',
            evaluation: 'all',
            status: 'all',
        })
        setRoleAssignmentSearchValue('')
    }

    const updateMutation = useMutation({
        mutationFn: async (collaboratorSk: string) => {
            setIsAddingCollab(true)

            if (selectedRole) {
                const response = await getCollabByRole(
                    collaboratorSk.split('#')[1],
                    selectedRole,
                )
                if (!response.success) throw new Error(response.error)
                return response.data
            }

            throw Error('Role not selected')
        },
        onSuccess: async (collaborator) => {
            if (collaborator) {
                queryClient.setQueryData<FullResponse<TCollabsByRole>>(
                    collaboratorsKeys.byRole(
                        selectedRole?.roleName || 'default-role',
                    ),
                    (old) => {
                        if (!old) {
                            return old
                        }
                        const exists = old.items.some(
                            (item) => item.sk === collaborator.sk,
                        )

                        if (exists) {
                            return old
                        }

                        return {
                            ...old,
                            items: [collaborator, ...old.items],
                            length: old.length + 1,
                        }
                    },
                )

                toast.push(
                    <Notification
                        title="Se agregó el colaborador exitósamente"
                        type="success"
                    />,
                )
            }
            setIsAddingCollab(false)
        },
        onError: (error: Error) => {
            setIsAddingCollab(false)
            toast.push(
                <Notification
                    title={
                        error.message || 'no fue posible agregar al colaborador'
                    }
                    type="danger"
                />,
            )
        },
    })

    const getCollabsOptions = () => {
        if (!collaboratorsList?.data?.items || !usersList?.items) return []

        const collabs = collaboratorsList?.data?.items?.filter(
            (collab) =>
                usersList?.items.find((user) => user.sk === collab.sk) ===
                undefined,
        )
        return (
            collabs.map(
                (collaborator) =>
                    ({
                        label: collaborator.name,
                        value: collaborator.sk,
                        position: collaborator.position,
                        pictureUrl: collaborator.pictureUrl,
                    }) as Option,
            ) ?? []
        )
    }

    return (
        <div className="grid grid-cols-8 grid-rows-1 md:items-center md:justify-between gap-2">
            <Select<Option>
                className="col-span-2"
                instanceId="collabs"
                isClearable
                placeholder="Seleccionar colaborador"
                options={getCollabsOptions()}
                isDisabled={updateMutation.isPending}
                isLoading={
                    isLoadingCollaborators ||
                    isLoadingCollabsByRole ||
                    updateMutation.isPending
                }
                components={{
                    Option: CustomSelectOption,
                    Control: CustomControl,
                }}
                onChange={(opt) => {
                    if (!opt?.value) return
                    updateMutation.mutate(opt?.value || '')
                }}
            />
            <ServiceDetailsRoleAssignmentSearch
                onInputChange={handleInputChange}
            />
            <Select
                className="flex-2/4"
                isClearable
                placeholder="Estado"
                options={statusOptions}
                value={
                    statusOptions.find(
                        (o) => o.value === roleAssignmentFilterData.status,
                    ) ?? null
                }
                onChange={(option) =>
                    setRoleAssignmentFilterData({
                        ...roleAssignmentFilterData,
                        status: option?.value || 'all',
                    })
                }
            />
            <Select
                className="flex-1/4"
                isClearable
                placeholder="Evaluación"
                options={evaluationOptions}
                value={
                    evaluationOptions.find(
                        (o) => o.value === roleAssignmentFilterData.evaluation,
                    ) ?? null
                }
                onChange={(option) =>
                    setRoleAssignmentFilterData({
                        ...roleAssignmentFilterData,
                        evaluation: option?.value || 'all',
                    })
                }
            />
            <Select
                className="flex-1/4"
                isClearable
                placeholder="Anexo"
                options={annexOptions}
                value={
                    annexOptions.find(
                        (o) => o.value === roleAssignmentFilterData.annexes,
                    ) ?? null
                }
                onChange={(option) =>
                    setRoleAssignmentFilterData({
                        ...roleAssignmentFilterData,
                        annexes: option?.value || 'all',
                    })
                }
            />
            <Button
                variant="default"
                type="button"
                className="w-full"
                onClick={handleResetFilters}
            >
                {t('services.filter.resetButton')}
            </Button>
        </div>
    )
}

export default ServiceDetailsRoleAssignmentTableTools
