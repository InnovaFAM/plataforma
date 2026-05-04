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

interface ReportsHHProjectionGapChartProps {
    data: HHProjectionRow[]
}

const ReportsHHProjectionGapChart = ({
    data,
}: ReportsHHProjectionGapChartProps) => {
    const categories = data.map((item) =>
        dayjs(`${item.month}-01`).format('MMM-YY'),
    )

    const series = [
        {
            name: 'Brecha HH',
            data: data.map((item) => item.gapHH),
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
                borderRadius: 6,
                distributed: true,
                columnWidth: '50%',
            },
        },
        colors: data.map((item) => (item.gapHH < 0 ? '#ef4444' : '#10b981')),
        dataLabels: {
            enabled: false,
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
            show: false,
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
                <h4 className="text-xl font-semibold">Brecha HH por mes</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Diferencia entre HH cubiertas y HH requeridas. Valores
                    negativos indican déficit.
                </p>
            </div>

            <Chart options={options} series={series} type="bar" height={340} />
        </div>
    )
}

export default ReportsHHProjectionGapChart
