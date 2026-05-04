'use client'

import { useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import DataTable, { ColumnDef } from '@/components/shared/DataTable'
import useTranslation from '@/utils/hooks/useTranslation'
import { TCertificate } from '../types'

interface GlobalCertificationsTableProps {
    data?: TCertificate[]
    isLoadingData?: boolean
}

const GlobalCertificationsTable = ({
    data = [],
    isLoadingData = false,
}: GlobalCertificationsTableProps) => {
    const t = useTranslation()

    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const columns: ColumnDef<TCertificate>[] = useMemo(
        () => [
            {
                header: t('certifications.tables.global.name'),
                accessorKey: 'name',
                cell: ({ row }) => (
                    <span className="font-semibold line-clamp-2 text-ellipsis overflow-hidden">
                        {row.original.name || '--'}
                    </span>
                ),
            },
        ],
        [t],
    )

    const pagedData = useMemo(() => {
        const start = (pageIndex - 1) * pageSize
        return data.slice(start, start + pageSize)
    }, [data, pageIndex, pageSize])

    return (
        <AdaptiveCard className="mt-2">
            <DataTable
                columns={columns}
                data={pagedData}
                bodyMaxHeight={300}
                bodyMinHeight={300}
                loading={isLoadingData}
                pageSizes={[5, 10, 20]}
                pagingData={{
                    total: data.length,
                    pageIndex,
                    pageSize,
                }}
                onPaginationChange={(page) => setPageIndex(page)}
                onSelectChange={(size) => {
                    setPageSize(size)
                    setPageIndex(1)
                }}
            />
        </AdaptiveCard>
    )
}

export default GlobalCertificationsTable
