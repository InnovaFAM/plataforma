'use client'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
})

type AbsenceItem = {
    type: string
    hours: number
}

interface ReportsHHAbsencesChartProps {
    data: AbsenceItem[]
}

const ReportsHHAbsencesChart = ({ data }: ReportsHHAbsencesChartProps) => {
    const categories = data.map((item) => item.type)

    const series = [
        {
            name: 'HH ausencias',
            data: data.map((item) => item.hours),
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
                horizontal: true,
                borderRadius: 6,
                barHeight: '45%',
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories,
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
                <h4 className="text-xl font-semibold">HH ausencias</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Distribución de HH no trabajadas por tipo de ausencia.
                </p>
            </div>

            <Chart options={options} series={series} type="bar" height={340} />
        </div>
    )
}

export default ReportsHHAbsencesChart
