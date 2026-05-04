import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import { collaboratorsKeys } from '@/server/actions/collaborators/collaborator-keys'
import { listCollaborators } from '@/server/actions/collaborators/list-collaborators'
import type { TCollaboratorEntity, Filter } from '../types'

interface UseCollaboratorsPaginationProps {
    pageSize: number
    searchValue?: string
    filters?: Filter
}

export const useCollaboratorsPagination = ({
    pageSize,
    searchValue,
    filters,
}: UseCollaboratorsPaginationProps) => {
    const [tokenStack, setTokenStack] = useState<(string | undefined)[]>([
        undefined,
    ])
    const [batchIndex, setBatchIndex] = useState(0)
    const [localPage, setLocalPage] = useState(0)
    const batchPagesMapRef = useRef<Record<number, number>>({})

    const currentToken = tokenStack[batchIndex]

    const {
        data: batchData,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: collaboratorsKeys.list(currentToken),
        queryFn: async () => {
            const response = await listCollaborators(currentToken)
            if (!response.success) {
                throw new Error(response.error)
            }
            return response.data
        },
        staleTime: 5 * 60 * 1000,
    })

    const isFirstRender = useRef(true)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        setTokenStack([undefined])
        setBatchIndex(0)
        setLocalPage(0)
        batchPagesMapRef.current = {}
    }, [
        searchValue,
        filters?.role,
        filters?.status,
        filters?.assignations,
        pageSize,
    ])

    const filteredItems = (batchData?.items ?? []).filter((collaborator) => {
        const c = collaborator as TCollaboratorEntity
        const matchesSearch =
            !searchValue ||
            c.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
            c.address?.toLowerCase().includes(searchValue.toLowerCase())

        const matchesRole =
            !filters?.role?.length || filters.role === c.position

        const matchesStatus =
            !filters?.status ||
            (filters.status === 'active'
                ? c.status === true
                : c.status === false)

        return matchesSearch && matchesRole && matchesStatus
    }) as TCollaboratorEntity[]

    const pagesInBatch = Math.max(1, Math.ceil(filteredItems.length / pageSize))
    const pagedItems = filteredItems.slice(
        localPage * pageSize,
        (localPage + 1) * pageSize,
    )

    const hasNextToken = !!batchData?.last_evaluated_key
    const isLastLocalPage = localPage >= pagesInBatch - 1
    const isFirstPage = batchIndex === 0 && localPage === 0
    const hasNextPage = !isLastLocalPage || hasNextToken
    const isEmpty = filteredItems.length === 0 && !isLoading && !hasNextToken
    const pagesBeforeCurrent = Array.from(
        { length: batchIndex },
        (_, i) => batchPagesMapRef.current[i] ?? pagesInBatch,
    ).reduce((sum, pages) => sum + pages, 0)

    const currentPageNumber = pagesBeforeCurrent + localPage + 1
    useEffect(() => {
        if (batchData) {
            batchPagesMapRef.current[batchIndex] = Math.max(
                1,
                Math.ceil(filteredItems.length / pageSize),
            )
        }
    }, [batchData, batchIndex, filteredItems.length, pageSize])

    const goNext = () => {
        if (!isLastLocalPage) {
            setLocalPage((p) => p + 1)
        } else if (hasNextToken) {
            const newToken = batchData!.last_evaluated_key!
            const nextBatch = batchIndex + 1
            if (nextBatch < tokenStack.length) {
                setBatchIndex(nextBatch)
            } else {
                setTokenStack((s) => [...s, newToken])
                setBatchIndex(nextBatch)
            }
            setLocalPage(0)
        }
    }

    const goPrev = () => {
        if (localPage > 0) {
            setLocalPage((p) => p - 1)
        } else if (batchIndex > 0) {
            const prevBatch = batchIndex - 1
            const prevBatchPages = batchPagesMapRef.current[prevBatch] ?? 1
            setBatchIndex(prevBatch)
            setLocalPage(prevBatchPages - 1)
        }
    }

    return {
        pagedItems,
        isLoading,
        isFetching,
        isFirstPage,
        hasNextPage,
        isEmpty,
        currentPageNumber,
        goNext,
        goPrev,
    }
}
