import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { serviceKeys } from '@/server/actions/services/service-keys'
import { listServices } from '@/server/actions/services/list-services'
import type { TService, Filter } from '../types'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

interface UseServicesPaginationProps {
    pageSize: number
    searchValue?: string
    filters?: Filter
}

export const useServicesPagination = ({
    pageSize,
    searchValue,
    filters,
}: UseServicesPaginationProps) => {
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
        queryKey: serviceKeys.listServices(currentToken),
        queryFn: async () => {
            const response = await listServices(currentToken)
            if (!response.success) throw new Error(response.error)
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
        filters?.client,
        filters?.faena,
        filters?.status,
        filters?.minDate,
        filters?.maxDate,
        pageSize,
    ])

    const filteredItems = (batchData?.items ?? []).filter((service) => {
        const matchesSearch =
            !searchValue ||
            service.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            service.chore?.name
                ?.toLowerCase()
                .includes(searchValue.toLowerCase())

        const matchesFaena =
            !filters?.faena || service.chore?.name === filters?.faena
        const matchesClient =
            !filters?.client || service.client?.name === filters?.client
        const matchesStatus =
            !filters?.status?.length ||
            filters.status.includes(service.status || '')

        let matchesDate = true
        if (filters?.minDate || filters?.maxDate) {
            const serviceDate = dayjs(service.endDate)
            const start = filters?.minDate
                ? dayjs(filters.minDate).startOf('day')
                : dayjs('1900-01-01')
            const end = filters?.maxDate
                ? dayjs(filters.maxDate).endOf('day')
                : dayjs('2100-01-01')
            matchesDate = serviceDate.isBetween(start, end, null, '[]')
        }

        return (
            matchesSearch &&
            matchesFaena &&
            matchesClient &&
            matchesStatus &&
            matchesDate
        )
    }) as TService[]

    const pagesInBatch = Math.max(1, Math.ceil(filteredItems.length / pageSize))
    const pagedItems = filteredItems.slice(
        localPage * pageSize,
        (localPage + 1) * pageSize,
    )

    const hasNextToken = !!batchData?.last_evaluated_key
    const isLastLocalPage = localPage >= pagesInBatch - 1
    const isFirstPage = batchIndex === 0 && localPage === 0
    const hasNextPage = !isLastLocalPage || hasNextToken

    const pagesBeforeCurrent = Array.from(
        { length: batchIndex },
        (_, i) => batchPagesMapRef.current[i] ?? pagesInBatch,
    ).reduce((sum, pages) => sum + pages, 0)

    const currentPageNumber = pagesBeforeCurrent + localPage + 1

    useEffect(() => {
        if (batchData) {
            batchPagesMapRef.current[batchIndex] = pagesInBatch
        }
    }, [batchData, batchIndex, pagesInBatch])

    const goNext = () => {
        if (!isLastLocalPage) {
            setLocalPage((p) => p + 1)
        } else if (hasNextToken) {
            const newToken = batchData!.last_evaluated_key!
            const nextBatch = batchIndex + 1
            if (nextBatch >= tokenStack.length) {
                setTokenStack((s) => [...s, newToken])
            }
            setBatchIndex(nextBatch)
            setLocalPage(0)
        }
    }

    const goPrev = () => {
        if (localPage > 0) {
            setLocalPage((p) => p - 1)
        } else if (batchIndex > 0) {
            const prevBatch = batchIndex - 1
            setBatchIndex(prevBatch)
            setLocalPage((batchPagesMapRef.current[prevBatch] || 1) - 1)
        }
    }

    return {
        pagedItems,
        isLoading,
        isFetching,
        isFirstPage,
        hasNextPage,
        isEmpty: filteredItems.length === 0 && !isLoading && !hasNextToken,
        currentPageNumber,
        goNext,
        goPrev,
    }
}
