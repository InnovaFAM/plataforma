'use client'

import { useMemo } from 'react'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import useTranslation from '@/utils/hooks/useTranslation'
import ReportsHHProjectionGapChart from './ReportsHHProjectionGapChart'
import ReportsHHProjectionRequiredVsCoveredChart from './ReportsHHProjectionRequiredVsCoveredChart'
import type { HHProjectionResponse } from '../types'
import { TSelect } from '@/@types'

const Select = dynamic(() => import('@/components/ui/Select/Select'), {
    ssr: false,
})

interface ReportsHHProjectionSectionProps {
    data: HHProjectionResponse
    month: string
    horizonMonths: number
    onMonthChange: (value: string) => void
    onHorizonChange: (value: number) => void
    isRefreshing?: boolean
}

const ReportsHHProjectionSection = ({
    data,
    month,
    horizonMonths,
    onMonthChange,
    onHorizonChange,
    isRefreshing,
}: ReportsHHProjectionSectionProps) => {
    const monthOptions = useMemo(() => {
        const current = dayjs().startOf('month')

        return Array.from({ length: 24 }, (_, index) => {
            const item = current.subtract(6, 'month').add(index, 'month')
            return {
                label: item.format('MMM-YY'),
                value: item.format('YYYY-MM'),
            }
        })
    }, [])

    const horizonOptions = useMemo(() => {
        const options = data.filters.available.horizonOptions ?? [6, 12, 18]

        return options.map((value) => ({
            label: `${value} meses`,
            value: String(value),
        }))
    }, [data.filters.available.horizonOptions])

    const projectionData = data.charts.hhProjectionByMonth
    const kpis = data.kpis

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold">
                            Reportes de Horas Hombre (HH)
                        </h2>
                        {isRefreshing ? (
                            <span className="text-xs text-muted-foreground">
                                Actualizando...
                            </span>
                        ) : null}
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                        Proyección de HH requeridas, cubiertas y brecha mensual.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="w-full md:w-[220px]">
                        <Select
                            instanceId="hh-report-base-month-selector"
                            placeholder={'Seleccionar mes base'}
                            options={monthOptions}
                            value={
                                monthOptions.find(
                                    (option) => option.value === month,
                                ) ?? null
                            }
                            onChange={(value) =>
                                onMonthChange(
                                    (value as TSelect | null)?.value ?? month,
                                )
                            }
                        />
                    </div>

                    <div className="w-full md:w-[180px]">
                        <Select
                            instanceId="hh-report-horizon-selector"
                            placeholder="Horizonte"
                            options={horizonOptions}
                            value={
                                horizonOptions.find(
                                    (option) =>
                                        Number(option.value) === horizonMonths,
                                ) ?? null
                            }
                            onChange={(value) =>
                                onHorizonChange(
                                    Number(
                                        (value as TSelect | null)?.value ??
                                            horizonMonths,
                                    ),
                                )
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            HH requeridas
                        </span>
                        <span className="text-2xl font-bold">
                            {kpis.totalRequiredHH.toLocaleString('es-CL')}
                        </span>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            HH cubiertas
                        </span>
                        <span className="text-2xl font-bold">
                            {kpis.totalCoveredHH.toLocaleString('es-CL')}
                        </span>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            Brecha total
                        </span>
                        <span
                            className={`text-2xl font-bold ${
                                kpis.totalGapHH < 0
                                    ? 'text-red-500'
                                    : 'text-emerald-500'
                            }`}
                        >
                            {kpis.totalGapHH.toLocaleString('es-CL')}
                        </span>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            Mes más crítico
                        </span>
                        <span className="text-lg font-bold">
                            {kpis.worstMonth
                                ? dayjs(`${kpis.worstMonth}-01`).format(
                                      'MMM-YY',
                                  )
                                : '-'}
                        </span>
                        <span className="text-sm text-red-500">
                            {kpis.worstMonthGapHH !== null
                                ? `${kpis.worstMonthGapHH.toLocaleString(
                                      'es-CL',
                                  )} HH`
                                : ''}
                        </span>
                    </div>
                </AdaptiveCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AdaptiveCard>
                    <ReportsHHProjectionRequiredVsCoveredChart
                        data={projectionData}
                    />
                </AdaptiveCard>

                <AdaptiveCard>
                    <ReportsHHProjectionGapChart data={projectionData} />
                </AdaptiveCard>
            </div>
        </div>
    )
}

export default ReportsHHProjectionSection
