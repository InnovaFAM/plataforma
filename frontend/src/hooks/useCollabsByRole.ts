import { TServiceRole } from '@/app/(protected-pages)/services/types'
import { collaboratorsKeys } from '@/server/actions/collaborators/collaborator-keys'
import { getCollaboratorsByRole } from '@/server/actions/collaborators/get-collabs-by-role'
import { useQuery } from '@tanstack/react-query'

export function useCollabsByRole(selectedRole?: TServiceRole | null) {
    return useQuery({
        queryKey: collaboratorsKeys.byRole(
            selectedRole?.roleName || 'default-role',
        ),

        queryFn: async () => {
            if (!selectedRole) {
                throw new Error('Role not selected')
            }

            const response = await getCollaboratorsByRole(selectedRole)

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },

        enabled: !!selectedRole,
    })
}
