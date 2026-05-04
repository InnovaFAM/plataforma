import CollaboratorsListSearch from './CollaboratorsListSearch'
import CollaboratorsTableFilter from './CollaboratorsTableFilter'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TCollaboratorEntity } from '../types'

interface CollaboratorsListTableToolsProps {
    collaborators: TCollaboratorEntity[]
}

const CollaboratorsListTableTools = ({
    collaborators,
}: CollaboratorsListTableToolsProps) => {
    const { onAppendQueryParams } = useAppendQueryParams()
    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
        })
    }

    const roles = Array.from(
        new Set(
            collaborators
                .map((collaborator) => collaborator.position)
                .filter(Boolean),
        ),
    ).map((role) => ({
        label: role || '',
        value: role || '',
        className: '',
    }))

    //TODO: commented until backend exposes assignations in the list endpoint
    const assignations = [] as {
        label: string
        value: string
        className: string
    }[]
    // const assignations = Array.from(
    //     new Set(
    //         collaborators
    //             .flatMap((collaborator) =>
    //                 collaborator.assignations.map((a) => a.name),
    //             )
    //             .filter(Boolean),
    //     ),
    // ).map((assignation) => ({
    //     label: assignation || '',
    //     value: assignation || '',
    //     className: '',
    // }))

    const statusValues = [
        { label: 'Active', value: 'active', className: '' },
        { label: 'Inactive', value: 'inactive', className: '' },
    ]

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <CollaboratorsListSearch onInputChange={handleInputChange} />
            <CollaboratorsTableFilter
                assignations={assignations}
                roles={roles}
                status={statusValues}
            />
        </div>
    )
}

export default CollaboratorsListTableTools
