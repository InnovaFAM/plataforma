'use client'
import { Button, Skeleton } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'

interface CollaboratorDetailsHeaderProps {
    collaboratorId: string
    isLoading?: boolean
}

const CollaboratorDetailsHeader = ({
    collaboratorId,
    isLoading = false,
}: CollaboratorDetailsHeaderProps) => {
    const t = useTranslation()

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
                    <Button variant="default" disabled={isLoading}>
                        {t('collaborators.details.header.exportButton')}
                    </Button>
                    <Button variant="solid" disabled={isLoading}>
                        {t('collaborators.details.header.syncButton')}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default CollaboratorDetailsHeader
