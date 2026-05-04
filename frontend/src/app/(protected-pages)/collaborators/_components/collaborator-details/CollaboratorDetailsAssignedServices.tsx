import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { TCollaboratorEntity } from '../../types'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import useTranslation from '@/utils/hooks/useTranslation'
import getUserAssignmentStatusText from '@/app/(protected-pages)/services/_utils/getUserAssignmentStatusText'
import Link from 'next/link'

interface CollaboratorDetailsAssignedServicesProps {
    collaborator: TCollaboratorEntity
}

const CollaboratorDetailsAssignedServices = ({
    collaborator,
}: CollaboratorDetailsAssignedServicesProps) => {
    const t = useTranslation()
    return (
        <AdaptiveCard>
            <div className="flex flex-col gap-4 my-2 px-4">
                <h4 className="text-xl font-extrabold text-black">
                    {t('collaborators.details.assignedServices')}
                </h4>
                {collaborator?.assignments?.length ? (
                    <div className="flex flex-col gap-2">
                        {collaborator?.assignments?.map((assignment) => (
                            <div
                                key={assignment.serviceSk}
                                className="flex justify-between items-center p-4 rounded-2xl bg-gray-50"
                            >
                                <div className="flex items-center gap-2 text-xs">
                                    <Link
                                        className="group-hover:text-primary"
                                        href={`/services/${assignment.serviceSk.split('#')[1]}`}
                                        target="_blank"
                                    >
                                        <p className="font-extrabold text-sm heading-text line-clamp-2 text-ellipsis overflow-hidden">
                                            {assignment.serviceName}
                                        </p>
                                        <span className="font-semibold text-sm block whitespace-nowrap overflow-hidden text-ellipsis cursor-default">
                                            {assignment.roleName}
                                        </span>
                                    </Link>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <p className="text-sm font-bold text-black text-end">
                                        {getUserAssignmentStatusText(
                                            assignment.status,
                                            t,
                                        )}
                                    </p>
                                    <span className="text-end">
                                        <span className="text-sm font-semibold text-gray-500">
                                            {`${getDayJsDate(assignment.startedAt)} – ${getDayJsDate(assignment.endedAt)}`}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        {t('collaborators.details.noAssignedServices')}
                    </p>
                )}
            </div>
        </AdaptiveCard>
    )
}

export default CollaboratorDetailsAssignedServices
