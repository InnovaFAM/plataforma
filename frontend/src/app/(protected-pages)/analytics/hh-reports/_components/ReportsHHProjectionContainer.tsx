'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import ReportsHHProjectionSection from './ReportsHHProjectionSection'
import { useHHProjection } from '../hooks'
import ReportsHHProjectionSectionSkeleton from './ReportsHHProjectionSectionSkeleton'
const ReportsHHProjectionContainer = () => {
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
    const [horizonMonths, setHorizonMonths] = useState(12)

    const { data, isLoading, isFetching, error } = useHHProjection({
        month,
        horizonMonths,
    })

    if (isLoading) {
        return <ReportsHHProjectionSectionSkeleton />
    }

    if (error || !data?.data) {
        return (
            <div className="rounded-2xl border p-6">
                Error cargando la proyección de HH
            </div>
        )
    }

    return (
        <ReportsHHProjectionSection
            data={data.data}
            month={month}
            horizonMonths={horizonMonths}
            onMonthChange={setMonth}
            onHorizonChange={setHorizonMonths}
            isRefreshing={isFetching}
        />
    )
}

export default ReportsHHProjectionContainer
