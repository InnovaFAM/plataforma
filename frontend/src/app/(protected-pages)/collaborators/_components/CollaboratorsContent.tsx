'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Button, Notification, toast } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { BsPersonPlus } from 'react-icons/bs'
import { TbCloudDownload } from 'react-icons/tb'
import CollaboratorsListTableTools from './CollaboratorsListTableTools'
import CollaboratorsListTable from './CollaboratorsListTable'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useCollaboratorsStore } from '../_store/collaboratorsStore'
import { listCollaborators } from '@/server/actions/collaborators/list-collaborators'
import {
    collaboratorsKeys,
    exportKeys,
    syncKeys,
} from '@/server/actions/collaborators/collaborator-keys'
import { useCan } from '@/hooks/useCan'
import { syncCollabs } from '@/server/actions/collaborators/sync-action'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { exportCollabs } from '@/server/actions/collaborators/export-action'
import useCurrentSession from '@/utils/hooks/useCurrentSession'

interface CollaboratorsContentProps {
    params: { [key: string]: string | string[] | undefined }
}

const CollaboratorsContent = ({ params }: CollaboratorsContentProps) => {
    const t = useTranslation()
    const { session } = useCurrentSession()
    const { protectedQueryFn } = useProtectedQueryFn()
    const canExportReport = useCan('reports:export')
    const canSyncCollabs = useCan('collaborators:sync')
    const { setFilterData } = useCollaboratorsStore()

    const { data: collaboratorsList } = useQuery({
        queryKey: collaboratorsKeys.all,
        queryFn: () => protectedQueryFn(() => listCollaborators()),
    })

    const mutation = useMutation({
        mutationKey: syncKeys.collabs,
        mutationFn: syncCollabs,
        onSuccess: () => {
            toast.push(
                <Notification type="success">
                    Los colaboradores comenzaron a sincronizarse. Esto puede
                    tardar varios minutos.
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

    const exportMutation = useMutation({
        mutationKey: exportKeys.collabs,
        mutationFn: exportCollabs,
        onSuccess: () => {
            toast.push(
                <Notification type="success">
                    Recibirás en los próximos minutos el informe de
                    colaboradores a tu correo {session?.user.email}.
                </Notification>,
            )
        },
        onError: (error) => {
            toast.push(
                <Notification type="danger">
                    Hubo un error al generar el informe de colaboradores.{' '}
                    {error.message}
                </Notification>,
            )
        },
    })

    const urlFilters = useMemo(() => {
        const decode = (val: string | string[] | undefined) =>
            val ? decodeURIComponent(String(val).replace(/\+/g, ' ')) : ''

        return {
            assignations: decode(params.assignations),
            role: decode(params.role),
            status: decode(params.status),
        }
    }, [params])

    useEffect(() => {
        setFilterData(urlFilters)
    }, [urlFilters, setFilterData])

    return (
        <AdaptiveCard className="mt-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    {t('collaborators.header.title')}
                </h2>
                <div className="flex items-center gap-2">
                    {canExportReport && (
                        <Button
                            variant="default"
                            icon={<TbCloudDownload />}
                            onClick={() => exportMutation.mutate()}
                            loading={exportMutation.isPending}
                            disabled={exportMutation.isPending}
                        >
                            {exportMutation.isPending
                                ? 'Generando...'
                                : t('collaborators.header.exportButton')}
                        </Button>
                    )}
                    {canSyncCollabs && (
                        <Button
                            variant="solid"
                            icon={<BsPersonPlus />}
                            onClick={() => mutation.mutate()}
                            loading={mutation.isPending}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending
                                ? 'Sincronizando...'
                                : t('collaborators.header.syncButton')}
                        </Button>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <CollaboratorsListTableTools
                    collaborators={collaboratorsList?.data?.items || []}
                />
                <CollaboratorsListTable
                    pageSize={parseInt(params.pageSize as string) || 10}
                    searchValue={params.query as string}
                    filters={urlFilters}
                />
            </div>
        </AdaptiveCard>
    )
}

export default CollaboratorsContent
