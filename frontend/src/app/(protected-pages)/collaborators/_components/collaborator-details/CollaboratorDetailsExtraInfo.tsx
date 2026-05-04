import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { TCollaboratorEntity } from '../../types'
import useTranslation from '@/utils/hooks/useTranslation'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'

interface CollaboratorDetailsExtraInfoProps {
    collaborator: TCollaboratorEntity
}

const CollaboratorDetailsExtraInfo = ({
    collaborator,
}: CollaboratorDetailsExtraInfoProps) => {
    const t = useTranslation()

    return (
        <AdaptiveCard>
            <h4 className="text-xl font-extrabold text-black mb-4">
                {t('collaborators.details.additionalInfo')}
            </h4>
            {collaborator?.vacationBalance ? (
                <>
                    <hr className="my-4" />
                    <div className="flex flex-col gap-4">
                        <h6 className="font-extrabold text-black">
                            {t('collaborators.details.availableVacations')}
                        </h6>
                        <span className="font-semibold text-gray-500 ">
                            {collaborator?.vacationBalance}{' '}
                            {t('collaborators.details.days')}
                        </span>
                    </div>
                </>
            ) : null}
            {collaborator?.annex?.length ? (
                <>
                    <hr className="my-4" />
                    <div className="flex flex-col gap-4">
                        <h6 className="font-extrabold text-black">
                            {t('collaborators.details.annex')}
                        </h6>
                        <span className="font-semibold text-gray-500 ">
                            {collaborator?.annex}
                        </span>
                    </div>
                </>
            ) : null}
            {collaborator?.contract ? (
                <>
                    <hr className="my-3" />
                    <div className="flex flex-col gap-4">
                        <h6 className="font-extrabold text-black">
                            {t('collaborators.details.contract')}
                        </h6>
                        <div className="flex flex-col justify-center items-start gap-2">
                            <span className="font-semibold text-gray-500 ">
                                {collaborator?.contract?.type}
                            </span>
                            <span className="font-semibold text-gray-500 ">
                                {collaborator?.contract?.startAt &&
                                collaborator?.contract?.endAt ? (
                                    <span className="text-sm font-semibold">
                                        {`${getDayJsDate(collaborator.contract.startAt)} – ${getDayJsDate(collaborator.contract.endAt)}`}
                                    </span>
                                ) : collaborator?.contract?.startAt ? (
                                    <span className="text-sm font-semibold">
                                        {`${getDayJsDate(collaborator.contract.startAt)}`}
                                    </span>
                                ) : null}
                            </span>
                        </div>
                    </div>
                </>
            ) : null}

            {!collaborator?.vacationBalance &&
            !collaborator?.annex?.length &&
            !collaborator?.contract ? (
                <p className="text-gray-500">
                    {t('collaborators.details.noAdditionalInfo')}
                </p>
            ) : null}
        </AdaptiveCard>
    )
}

export default CollaboratorDetailsExtraInfo
