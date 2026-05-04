'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ReportsHHWorkedByCodeChart from './ReportsHHWorkedByCodeChart'
import ReportsHHAbsencesChart from './ReportsHHAbsencesChart'
import ReportsHHDetailTable from './ReportsHHDetailTable'
import type { HHDetailResponse } from '../types'

const Select = dynamic(() => import('@/components/ui/Select/Select'), {
    ssr: false,
})

interface ReportsHHDetailSectionProps {
    data: HHDetailResponse | undefined
    selectedMonths: string[]
    selectedServices: string[]
    onMonthsChange: (
        values: Array<{ label: string; value: string }> | null,
    ) => void
    onServicesChange: (value: string[]) => void
    isRefreshing?: boolean
}

const ReportsHHDetailSection = ({
    data,
    selectedMonths,
    selectedServices,
    onMonthsChange,
    onServicesChange,
    isRefreshing,
}: ReportsHHDetailSectionProps) => {
    const monthOptions = useMemo(
        () =>
            data?.filters.available.months.map((month) => ({
                label: month,
                value: month,
            })),
        [data?.filters.available.months],
    )
    const serviceOptions = useMemo(
        () =>
            data?.filters.available.services.map((service) => ({
                label: `${service.serviceId} · ${service.serviceName}`,
                value: service.serviceId,
            })),
        [data?.filters.available.services],
    )

    const kpis = data?.kpis

    return (
        <div className="flex flex-col gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">
                        Análisis detallado de HH
                    </h2>
                    {isRefreshing ? (
                        <span className="text-xs text-muted-foreground">
                            Actualizando...
                        </span>
                    ) : null}
                </div>

                <p className="text-sm text-muted-foreground mt-1">
                    Desglose de HH por servicio, ausencias y detalle mensual.
                </p>
            </div>

            <AdaptiveCard>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-1 w-full md:w-1/2">
                        <label className="text-sm text-muted-foreground">
                            Rango de fechas
                        </label>
                        <Select
                            instanceId="hh-detail-months-selector"
                            placeholder="Seleccionar meses"
                            isMulti
                            options={monthOptions}
                            value={monthOptions?.filter((option) =>
                                selectedMonths.includes(option.value),
                            )}
                            onChange={(values) =>
                                onMonthsChange(
                                    values as
                                        | { label: string; value: string }[]
                                        | null,
                                )
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-1 w-full md:w-1/2">
                        <label className="text-sm text-muted-foreground">
                            Servicios
                        </label>
                        <Select
                            instanceId="hh-detail-services-selector"
                            placeholder="Seleccionar servicios"
                            isMulti
                            options={serviceOptions}
                            value={serviceOptions?.filter((option) =>
                                selectedServices.includes(option.value),
                            )}
                            onChange={(values) =>
                                onServicesChange(
                                    (values as any).map(
                                        (
                                            v: {
                                                label: string
                                                value: string
                                            } | null,
                                        ) => v?.value,
                                    ),
                                )
                            }
                        />
                    </div>
                </div>
            </AdaptiveCard>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            HH trabajadas
                        </span>
                        <span className="text-2xl font-bold">
                            {kpis?.totalWorkedHH.toLocaleString('es-CL')}
                        </span>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            HH ausencias
                        </span>
                        <span className="text-2xl font-bold">
                            {kpis?.totalAbsenceHH.toLocaleString('es-CL')}
                        </span>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            Servicios activos
                        </span>
                        <span className="text-2xl font-bold">
                            {kpis?.activeServices}
                        </span>
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                            % ausentismo
                        </span>
                        <span className="text-2xl font-bold">
                            {kpis?.absenceRatePct}%
                        </span>
                    </div>
                </AdaptiveCard>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AdaptiveCard>
                    <ReportsHHWorkedByCodeChart
                        data={
                            data?.charts.workedHoursByService.map((item) => ({
                                code: item.serviceId,
                                workedHH: item.workedHH,
                            })) || []
                        }
                    />
                </AdaptiveCard>

                <AdaptiveCard>
                    <ReportsHHAbsencesChart
                        data={data?.charts.absencesByType || []}
                    />
                </AdaptiveCard>
            </div>

            <ReportsHHDetailTable data={data?.table || []} />
        </div>
    )
}

export default ReportsHHDetailSection
