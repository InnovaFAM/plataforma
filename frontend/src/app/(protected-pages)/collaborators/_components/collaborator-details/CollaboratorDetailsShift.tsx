import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { TCollaboratorEntity } from '../../types'
import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'

interface CollaboratorDetailsExtraInfoProps {
    collaborator: TCollaboratorEntity
}

const CollaboratorDetailsShift = ({
    collaborator,
}: CollaboratorDetailsExtraInfoProps) => {
    return (
        <AdaptiveCard>
            <h4 className="text-xl font-extrabold text-black mb-4">
                Información de Turno
            </h4>
            {collaborator?.shift?.type ? (
                <>
                    <hr className="my-4" />
                    <div className="flex flex-col gap-4">
                        <h6 className="font-extrabold text-black">Tipo</h6>
                        <span className="font-semibold text-gray-500 ">
                            {collaborator?.shift?.type}
                        </span>
                    </div>
                </>
            ) : null}
            {collaborator?.shift?.description ? (
                <>
                    <hr className="my-4" />
                    <div className="flex flex-col gap-4">
                        <h6 className="font-extrabold text-black">
                            Descripción
                        </h6>
                        <span className="font-semibold text-gray-500 ">
                            {collaborator?.shift?.description}
                        </span>
                    </div>
                </>
            ) : null}
            {collaborator?.shift?.startedAt || collaborator?.shift?.endedAt ? (
                <>
                    <hr className="my-4" />
                    <div className="flex flex-col gap-4">
                        <h6 className="font-extrabold text-black">
                            Fecha de Inicio / Término
                        </h6>
                        <span className="font-semibold text-gray-500 ">
                            {getDayJsDate(collaborator?.shift?.startedAt)} -{' '}
                            {getDayJsDate(collaborator?.shift?.endedAt)}
                        </span>
                    </div>
                </>
            ) : null}

            {!collaborator?.shift ? (
                <p className="text-gray-500">Sin información del turno</p>
            ) : null}
        </AdaptiveCard>
    )
}

export default CollaboratorDetailsShift
