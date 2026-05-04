'use client'

import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import { listBackOfficeRoles } from '@/server/actions/backoffice/list-roles'
import { collaboratorsKeys } from '@/server/actions/collaborators/collaborator-keys'
import { listCollaborators } from '@/server/actions/collaborators/list-collaborators'
import { useQuery } from '@tanstack/react-query'

const Page = () => {
    const { data: backofficeRoles, isLoading: isLoadingBackofficeRoles } =
        useQuery({
            queryKey: backOfficeKeys.roles(),
            queryFn: async () => {
                const response = await listBackOfficeRoles(undefined, 500)
                if (!response.success) {
                    console.log(response.error)
                    throw new Error(response.error)
                }
                return response.data
            },
        })

    const { data: collaboratorRoles, isLoading: isLoadingCollaboratorRoles } =
        useQuery({
            queryKey: collaboratorsKeys.list(),
            queryFn: async () => {
                const response = await listCollaborators(undefined, 500)
                if (!response.success) {
                    throw new Error(response.error)
                }
                return response.data
            },
            select: (data) => {
                const rolesSet = new Set<string>()
                data?.items.forEach((collaborator) => {
                    rolesSet.add(collaborator.position || '')
                })
                return Array.from(rolesSet).filter(Boolean)
            },
        })

    if (isLoadingBackofficeRoles || isLoadingCollaboratorRoles) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex gap-4">
                <div className="w-1/2">
                    <h4>
                        Roles listados en backoffice, ordenados alfabéticamente
                    </h4>
                    <ul>
                        {backofficeRoles?.items
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((role) => (
                                <li key={role.sk}>{role.name}</li>
                            ))}
                    </ul>
                </div>
                <div className="w-1/2">
                    <h4>
                        Roles listados en colaboradores, ordenados
                        alfabéticamente
                    </h4>
                    <ul>
                        {collaboratorRoles
                            ?.sort((a, b) => a.localeCompare(b))
                            .map((role, index) => (
                                <li key={index}>{role}</li>
                            ))}
                    </ul>
                </div>
            </div>
            <div className="w-full">
                <h4>
                    Roles de colaboradores que no están en backoffice, ordenados
                    alfabéticamente
                </h4>
                <ul>
                    {collaboratorRoles
                        ?.filter(
                            (role) =>
                                !backofficeRoles?.items.some(
                                    (backofficeRole) =>
                                        backofficeRole.name === role,
                                ),
                        )
                        .map((role, index) => (
                            <li key={index}>{role}</li>
                        ))}
                </ul>
            </div>
        </div>
    )
}

export default Page
