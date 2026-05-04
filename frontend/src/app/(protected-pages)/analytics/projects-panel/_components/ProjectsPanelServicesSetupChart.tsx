import { Dialog } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { useState } from 'react'
import { FaExpand } from 'react-icons/fa6'
import { CHART_COLORS } from '../../_constants/chartColors'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface ProjectsPanelServicesSetupChartProps {
    data?: ApexNonAxisChartSeries
    categories?: string[]
}

const ProjectsPanelServicesSetupChart: React.FC<
    ProjectsPanelServicesSetupChartProps
> = ({ data, categories }) => {
    const t = useTranslation()
    const [view, setView] = useState<'regular' | 'full-screen'>('regular')
    const renderChart = () => {
        return (
            <Chart
                options={{
                    chart: {
                        type: 'line',
                        zoom: {
                            enabled: false,
                        },
                    },
                    markers: {
                        size: 5,
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 3,
                    },
                    colors: [...CHART_COLORS],
                    xaxis: {
                        categories: categories,
                    },
                }}
                type="line"
                series={data}
                height={300}
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
                {t('projectsPanel.content.charts.servicesSetupTitle')}
            </h4>
            <p className="text-sm text-muted-foreground">
                {t('projectsPanel.content.charts.servicesSetupSubtitle')}
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
                                'projectsPanel.content.charts.servicesSetupTitle',
                            )}
                        </h4>
                        {renderChart()}
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default ProjectsPanelServicesSetupChart
