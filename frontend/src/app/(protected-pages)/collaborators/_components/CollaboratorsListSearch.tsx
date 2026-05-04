'use client'

import Input from '@/components/ui/Input'
import useDebounce from '@/utils/hooks/useDebounce'
import { TbSearch } from 'react-icons/tb'
import type { ChangeEvent } from 'react'
import useTranslation from '@/utils/hooks/useTranslation'

type CollaboratorsListSearchProps = {
    onInputChange: (value: string) => void
}

const CollaboratorsListSearch = (props: CollaboratorsListSearchProps) => {
    const { onInputChange } = props
    const t = useTranslation()

    function handleDebounceFn(value: string) {
        onInputChange?.(value)
    }

    const debounceFn = useDebounce(handleDebounceFn, 500)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    return (
        <Input
            placeholder={t('collaborators.tools.searchPlaceholder')}
            suffix={<TbSearch className="text-lg" />}
            onChange={handleInputChange}
        />
    )
}

export default CollaboratorsListSearch
