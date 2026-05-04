'use client'

import dayjs from 'dayjs'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
})

type HHProjectionRow = {
    month: string
    requiredHH: number
    confirmedHH: number
    proposedHH: number
    coveredHH: number
    gapHH: number
    coveragePct: number
}

interface ReportsHHProjectionRequiredVsCoveredChartProps {
    data: HHProjectionRow[]
}

const ReportsHHProjectionRequiredVsCoveredChart = ({
    data,
}: ReportsHHProjectionRequiredVsCoveredChartProps) => {
    const categories = data.map((item) =>
        dayjs(`${item.month}-01`).format('MMM-YY'),
    )

    const series = [
        {
            name: 'HH requeridas',
            data: data.map((item) => item.requiredHH),
        },
        {
            name: 'HH confirmadas',
            data: data.map((item) => item.confirmedHH),
        },
        {
            name: 'HH propuestas',
            data: data.map((item) => item.proposedHH),
        },
    ]

    const options = {
        chart: {
            type: 'bar' as const,
            toolbar: {
                show: true,
            },
            fontFamily: 'inherit',
        },
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 6,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: false,
        },
        xaxis: {
            categories,
        },
        yaxis: {
            labels: {
                formatter: (value: number) => value.toLocaleString('es-CL'),
            },
        },
        legend: {
            position: 'bottom' as const,
        },
        tooltip: {
            y: {
                formatter: (value: number) =>
                    `${value.toLocaleString('es-CL')} HH`,
            },
        },
        grid: {
            borderColor: '#e5e7eb',
        },
    }

    return (
        <div className="flex flex-col gap-2">
            <div>
                <h4 className="text-xl font-semibold">
                    HH requeridas vs cubiertas
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Comparación mensual entre HH requeridas, confirmadas y
                    propuestas.
                </p>
            </div>

            <Chart options={options} series={series} type="bar" height={340} />
        </div>
    )
}

export default ReportsHHProjectionRequiredVsCoveredChart
