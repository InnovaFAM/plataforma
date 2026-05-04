import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { TCollaboratorEntity } from '../../types'
import { Avatar } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TbIdBadge2, TbMail, TbPhone } from 'react-icons/tb'

interface CollaboratorDetailsBasicInfoProps {
    collaborator: TCollaboratorEntity
}

const CollaboratorDetailsBasicInfo = ({
    collaborator,
}: CollaboratorDetailsBasicInfoProps) => {
    const t = useTranslation()
    return (
        <AdaptiveCard>
            <h4 className="text-xl font-extrabold text-black mb-4">
                {t('collaborators.details.basicInfo')}
            </h4>
            <div className="flex items-center gap-2">
                <Avatar
                    size={32}
                    shape="circle"
                    src={collaborator?.pictureUrl || ''}
                >
                    {!collaborator?.pictureUrl
                        ? collaborator?.name?.charAt(0)
                        : null}
                </Avatar>
                <div className="flex flex-col">
                    <b className="font-bold text-sm text-black">
                        {collaborator?.name}
                    </b>
                    <p className="text-xs font-semibold">
                        {collaborator?.position ||
                            t('collaborators.details.noPosition')}
                    </p>
                </div>
            </div>
            <hr className="my-4" />
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-semibold">
                        <TbIdBadge2 size={18} />
                    </span>
                    <span className="font-semibold text-gray-500 text-sm">
                        {collaborator?.rut}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-semibold">
                        <TbMail size={18} />
                    </span>
                    <span className="font-semibold text-gray-500 text-sm">
                        {collaborator?.email ? (
                            <a
                                href={`mailto:${collaborator.email}`}
                                tabIndex={0}
                            >
                                {collaborator.email}
                            </a>
                        ) : (
                            '–'
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-semibold">
                        <TbPhone size={18} />
                    </span>
                    <span className="font-semibold text-gray-500 text-sm">
                        {collaborator?.workNumber ||
                            collaborator?.personalNumber ||
                            '–'}
                    </span>
                </div>
                {collaborator?.address ? (
                    <>
                        <hr className="my-3" />
                        <h6 className="font-extrabold text-black">
                            {t('collaborators.details.address')}
                        </h6>
                        <div className="flex flex-col justify-center items-start gap-2">
                            {collaborator.address
                                .split(',')
                                ?.map((locPart, index) => (
                                    <span
                                        key={index}
                                        className="font-semibold text-gray-500"
                                    >
                                        {locPart}
                                    </span>
                                ))}
                        </div>
                    </>
                ) : null}
            </div>
        </AdaptiveCard>
    )
}

export default CollaboratorDetailsBasicInfo
