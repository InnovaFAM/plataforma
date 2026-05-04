'use client'
import useTranslation from '@/utils/hooks/useTranslation'
import { TbTableOff } from 'react-icons/tb'

interface TableEmptyStateProps {
    title?: string
    description?: string
}

const TableEmptyState = ({ title, description }: TableEmptyStateProps) => {
    const t = useTranslation()
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
            <h3 className="text-lg font-semibold text-gray-500">
                {title || t('table.emptyState.title')}
            </h3>
            {description && (
                <p className="text-sm text-gray-500 text-center">
                    {description}
                </p>
            )}
            <TbTableOff className="text-gray-400" size={64} />
        </div>
    )
}

export default TableEmptyState
