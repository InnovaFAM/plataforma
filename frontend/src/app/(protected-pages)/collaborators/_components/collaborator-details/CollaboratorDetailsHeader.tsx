'use client'
import { Button, Skeleton, toast, Notification } from '@/components/ui'
import { useCan } from '@/hooks/useCan'
import { syncKeys } from '@/server/actions/collaborators/collaborator-keys'
import { syncCollabById } from '@/server/actions/collaborators/sync-action'
import useTranslation from '@/utils/hooks/useTranslation'
import { useMutation } from '@tanstack/react-query'

interface CollaboratorDetailsHeaderProps {
    collaboratorId: string
    isLoading?: boolean
}

const CollaboratorDetailsHeader = ({
    collaboratorId,
    isLoading = false,
}: CollaboratorDetailsHeaderProps) => {
    const t = useTranslation()
    const canExportReport = useCan('reports:export')
    const canSyncCollab = useCan('collaborators:sync')

    const mutation = useMutation({
        mutationKey: syncKeys.collab(collaboratorId),
        mutationFn: () => syncCollabById(collaboratorId),
        onSuccess: () => {
            toast.push(
                <Notification type="success">
                    El colaborador ha comenzado a ser sincronizado, esto puede
                    tardar unos minutos.
                </Notification>,
            )
        },
        onError: (error) => {
            toast.push(
                <Notification type="danger">
                    No se ha podido sincronizar. {error.message}
                </Notification>,
            )
        },
    })

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center">
                    {t(`collaborators.details.header.title`)}{' '}
                    {isLoading ? (
                        <Skeleton className=" ml-4 w-32 h-6" />
                    ) : (
                        collaboratorId
                    )}
                </h3>
                <div className="flex gap-2 items-center">
                    {canExportReport && (
                        <Button variant="default" disabled>
                            {t('collaborators.details.header.exportButton')}
                        </Button>
                    )}
                    {canSyncCollab && (
                        <Button
                            variant="solid"
                            disabled={isLoading || mutation.isPending}
                            loading={mutation.isPending}
                        >
                            {mutation.isPending
                                ? 'Sincronizando...'
                                : t('collaborators.details.header.syncButton')}
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}

export default CollaboratorDetailsHeader
