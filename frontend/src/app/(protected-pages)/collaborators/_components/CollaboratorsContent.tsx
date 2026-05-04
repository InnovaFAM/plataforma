'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Button } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { BsPersonPlus } from 'react-icons/bs'
import { TbCloudDownload } from 'react-icons/tb'
import CollaboratorsListTableTools from './CollaboratorsListTableTools'
import CollaboratorsListTable from './CollaboratorsListTable'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useCollaboratorsStore } from '../_store/collaboratorsStore'
import { listCollaborators } from '@/server/actions/collaborators/list-collaborators'
import { collaboratorsKeys } from '@/server/actions/collaborators/collaborator-keys'

interface CollaboratorsContentProps {
    params: { [key: string]: string | string[] | undefined }
}

const CollaboratorsContent = ({ params }: CollaboratorsContentProps) => {
    const t = useTranslation()
    const { setFilterData } = useCollaboratorsStore()

    const { data: collaboratorsList } = useQuery({
        queryKey: collaboratorsKeys.all,
        queryFn: async () => {
            const response = await listCollaborators()

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
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
                    <Button variant="default" icon={<TbCloudDownload />}>
                        {t('collaborators.header.exportButton')}
                    </Button>
                    <Button variant="solid" icon={<BsPersonPlus />}>
                        {t('collaborators.header.syncButton')}
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <CollaboratorsListTableTools
                    collaborators={collaboratorsList?.items || []}
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
