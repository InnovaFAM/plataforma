import { QueryClient } from '@tanstack/react-query'
import { TCollabsByRole } from '../../collaborators/types'
import { FullResponse } from '@/@types/api-client'
import { collaboratorsKeys } from '@/server/actions/collaborators/collaborator-keys'

export const updateUserInList = (
    queryClient: QueryClient,
    roleName: string,
    updateCollabByRole: {
        sk: string
    } & Partial<
        Pick<TCollabsByRole, 'status' | 'startedAt' | 'endedAt' | 'clearance'>
    >,
) => {
    queryClient.setQueryData<FullResponse<TCollabsByRole>>(
        collaboratorsKeys.byRole(roleName || 'default-role'),
        (currentUsers: FullResponse<TCollabsByRole> | undefined) => {
            if (!currentUsers?.items) return currentUsers

            const items = currentUsers.items.map((user) =>
                user.sk === updateCollabByRole.sk
                    ? {
                          ...user,
                          ...updateCollabByRole,
                      }
                    : user,
            )

            return { items, length: currentUsers.length }
        },
    )
}
