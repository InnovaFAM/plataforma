import { Checkbox, toast, Notification } from '@/components/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    TServiceRole,
    TServiceRoleAssignment,
    TServiceRoleAssignmentUpdatePayload,
} from '../../types'
import { updateCollabToRoleInService } from '@/server/actions/services/add-collab-to-role-in-service'
import { TCollabsByRole } from '@/app/(protected-pages)/collaborators/types'
import { serviceKeys } from '@/server/actions/services/service-keys'
import React from 'react'
import { updateUserInList } from '../../_utils/updateUserInList'

type TClearanceCheckboxProps = {
    user: TCollabsByRole | undefined
    serviceRole: TServiceRole | undefined
}

const ClearanceCheckbox: React.FC<TClearanceCheckboxProps> = ({
    user,
    serviceRole,
}) => {
    const queryClient = useQueryClient()
    const isConfirmed = user?.status === 'confirmado'

    const updateMutation = useMutation({
        mutationFn: async (
            item: { pk: string } & Partial<
                Pick<
                    TServiceRoleAssignment,
                    'clearance' | 'collabId' | 'parentId' | 'entityId'
                >
            >,
        ) => {
            const data: TServiceRoleAssignmentUpdatePayload = {
                clearance: item.clearance,
            }
            const serviceHash = item.parentId!.split('#')[1]
            const roleHash = item.entityId!.split('#')[1]
            const response = await updateCollabToRoleInService(
                data,
                serviceHash,
                roleHash,
                item.collabId!,
            )

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: (data, item) => {
            const serviceHash = item.parentId!.split('#')[1]
            const roleHash = item.entityId!.split('#')[1]
            queryClient.invalidateQueries({
                queryKey: serviceKeys.updateClearanceCheckAssignment(
                    serviceHash,
                    roleHash,
                    item.collabId!,
                ),
            })
            toast.push(
                <Notification
                    title="Acreditación actualizada correctamente"
                    type="success"
                />,
            )

            updateUserInList(queryClient, serviceRole?.roleName || '', {
                sk: item.pk,
                clearance: item.clearance,
            })
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={error.message || 'Error al acreditar'}
                    type="danger"
                />,
            )
        },
    })

    const handleChange = (checked: boolean) => {
        const item: { pk: string } & Partial<
            Pick<
                TServiceRoleAssignment,
                'clearance' | 'collabId' | 'parentId' | 'entityId'
            >
        > = {
            pk: user?.sk || '',
            collabId: user?.sk.split('#')[1],
            clearance: checked,
            parentId: serviceRole?.pk,
            entityId: serviceRole?.sk,
        }
        console.log(checked)
        updateMutation.mutate(item)
    }
    return (
        <Checkbox
            checked={user?.clearance}
            disabled={!isConfirmed || updateMutation.isPending}
            onChange={handleChange}
        >
            {updateMutation.isPending ? 'Actualizando...' : null}
        </Checkbox>
    )
}

export default ClearanceCheckbox
