import { Dialog } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { useState } from 'react'
import { FaExpand } from 'react-icons/fa6'
import { CHART_COLORS } from '../../_constants/chartColors'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface ProjectsPanelProjectsPopulationChartProps {
    data?: ApexNonAxisChartSeries
    categories?: string[]
}

const ProjectsPanelProjectsPopulationChart: React.FC<
    ProjectsPanelProjectsPopulationChartProps
> = ({ data, categories }) => {
    const t = useTranslation()
    const [view, setView] = useState<'regular' | 'full-screen'>('regular')
    const renderChart = () => {
        return (
            <Chart
                options={{
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: '90%',
                            borderRadius: 4,
                        },
                    },
                    colors: CHART_COLORS,
                    dataLabels: {
                        enabled: false,
                    },
                    legend: {
                        show: true,
                        position: 'bottom',
                        horizontalAlign: 'center',
                        markers: {
                            shape: 'circle',
                        },
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ['transparent'],
                    },
                    xaxis: {
                        categories: categories,
                    },
                    fill: {
                        opacity: 1,
                    },
                }}
                series={data}
                height={300}
                type="bar"
            />
        )
    }

    return (
        <div className="flex flex-col w-full gap-4 relative">
            <FaExpand
                size={16}
                onClick={() =>
                    setView(view === 'regular' ? 'full-screen' : 'regular')
                }
                className="absolute top-0 right-0 hover:cursor-pointer hover:scale-110 transition-transform"
            />
            <h4 className="text-lg font-semibold">
                {t('projectsPanel.content.charts.projectsPopulationTitle')}
            </h4>
            <p className="text-sm text-muted-foreground">
                {t('projectsPanel.content.charts.projectsPopulationSubtitle')}
            </p>
            {renderChart()}
            <Dialog
                isOpen={view === 'full-screen'}
                onClose={() => setView('regular')}
                onRequestClose={() => setView('regular')}
                className="min-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col p-6"
            >
                <div className="w-full h-full p-4">
                    <div className="flex flex-col w-full h-full gap-4">
                        <h4 className="text-lg font-semibold">
                            {t(
                                'projectsPanel.content.charts.projectsPopulationTitle',
                            )}
                        </h4>
                        {renderChart()}
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ProjectsPanelProjectsPopulationChart
