'use client'

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
})

type WorkedByCodeItem = {
    code: string
    workedHH: number
}

interface ReportsHHWorkedByCodeChartProps {
    data: WorkedByCodeItem[]
}

const ReportsHHWorkedByCodeChart = ({
    data,
}: ReportsHHWorkedByCodeChartProps) => {
    const categories = data.map((item) => item.code)

    const series = [
        {
            name: 'HH trabajadas',
            data: data.map((item) => item.workedHH),
        },
    ]

    const options = {
        chart: {
            type: 'bar' as const,
            toolbar: { show: true },
            fontFamily: 'inherit',
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '50%',
            },
        },
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
                <h4 className="text-xl font-semibold">
                    HH trabajadas por código
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Total de HH acumuladas por código en el período
                    seleccionado.
                </p>
            </div>

            <Chart options={options} series={series} type="bar" height={340} />
        </div>
    )
}

export default ReportsHHWorkedByCodeChart
