'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { useQuery } from '@tanstack/react-query'
import CollaboratorDetailsBasicInfo from './CollaboratorDetailsBasicInfo'
import useTranslation from '@/utils/hooks/useTranslation'
import CollaboratorDetailsPerformanceEvaluations from './CollaboratorDetailsPerformanceEvaluations'
import CollaboratorDetailsAssignedServices from './CollaboratorDetailsAssignedServices'
import CollaboratorDetailsExtraInfo from './CollaboratorDetailsExtraInfo'
import { collaboratorKeys } from '@/server/actions/collaborators/collaborator-keys'
import { getCollaboratorById } from '@/server/actions/collaborators/get-collaborator-by-id'
import { TbFaceIdError } from 'react-icons/tb'
import Loading from '../../[slug]/loading'
import CollaboratorDetailsShift from './CollaboratorDetailsShift'
import CollaboratorCertificatesCompliance from './CollaboratorCertificatesCompliance'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'

interface CollaboratorDetailsContentProps {
    collaboratorId: string
}

const CollaboratorDetailsContent = ({
    collaboratorId,
}: CollaboratorDetailsContentProps) => {
    const { protectedQueryFn } = useProtectedQueryFn()
    const t = useTranslation()

    const { data, isLoading, isFetching } = useQuery({
        queryKey: collaboratorKeys.singleCollaborator(collaboratorId),
        queryFn: async () =>
            protectedQueryFn(() => getCollaboratorById(collaboratorId)),
    })

    if (isLoading || isFetching) return <Loading />

    const collaboratorData = data?.data

    return (
        <>
            {collaboratorData ? (
                <div className="relative flex flex-col gap-4 w-full my-4">
                    <div className="grow">
                        <div className="flex flex-col xl:flex-row gap-4">
                            <div className="flex flex-col gap-4 flex-4 xl:col-span-3">
                                <CollaboratorCertificatesCompliance
                                    data={collaboratorData}
                                />
                                <CollaboratorDetailsAssignedServices
                                    collaborator={collaboratorData}
                                />
                                <CollaboratorDetailsPerformanceEvaluations
                                    collaborator={collaboratorData}
                                    evaluations={
                                        collaboratorData.evaluations || []
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-4 flex-1 2xl:min-w-70">
                                <CollaboratorDetailsBasicInfo
                                    collaborator={collaboratorData}
                                />
                                <CollaboratorDetailsExtraInfo
                                    collaborator={collaboratorData}
                                />
                                <CollaboratorDetailsShift
                                    collaborator={collaboratorData}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <AdaptiveCard className="my-4 py-8 flex flex-col items-center justify-center gap-4">
                    <p className="text-center text-gray-500">
                        {t('collaborators.details.notFound')}
                    </p>
                    <TbFaceIdError
                        className="mx-auto mt-2 text-primary"
                        size={64}
                    />
                </AdaptiveCard>
            )}
        </>
    )
}

export default CollaboratorDetailsContent
