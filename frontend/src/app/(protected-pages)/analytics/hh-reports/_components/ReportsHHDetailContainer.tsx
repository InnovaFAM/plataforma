'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import ReportsHHDetailSection from './ReportsHHDetailSection'
import ReportsHHDetailSectionSkeleton from './ReportsHHDetailSectionSkeleton'
import { useHHDetail } from '../hooks'

const ReportsHHDetailContainer = () => {
    const [selectedMonths, setSelectedMonths] = useState<string[]>([
        dayjs().format('YYYY-MM'),
    ])
    const [selectedServices, setSelectedServices] = useState<string[]>([])

    const { data, isLoading, isFetching, error } = useHHDetail({
        months: selectedMonths,
        services: selectedServices,
    })

    const handleMonthsChange = (
        values: Array<{ label: string; value: string }> | null,
    ) => {
        if (!values || values.length === 0) {
            setSelectedMonths([])
            return
        }

        setSelectedMonths(values.map((item) => item.value))
    }

    if (isLoading) {
        return <ReportsHHDetailSectionSkeleton />
    }

    if (error || !data) {
        return (
            <div className="rounded-2xl border p-6">
                Error cargando el detalle de HH
            </div>
        )
    }

    return (
        <ReportsHHDetailSection
            data={data?.data}
            selectedMonths={selectedMonths}
            selectedServices={selectedServices}
            onMonthsChange={handleMonthsChange}
            onServicesChange={setSelectedServices}
            isRefreshing={isFetching}
        />
    )
}

export default ReportsHHDetailContainer
