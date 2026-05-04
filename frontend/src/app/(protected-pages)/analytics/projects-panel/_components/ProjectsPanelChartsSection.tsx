import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ProjectsPanelProjectsPopulationChart from './ProjectsPanelProjectsPopulationChart'
import ProjectsPanelServicesSetupChart from './ProjectsPanelServicesSetupChart'
import type { DashboardProjectsResponse } from '../types'

interface ProjectsPanelChartsSectionProps {
    data?: DashboardProjectsResponse
}

const ProjectsPanelChartsSection: React.FC<ProjectsPanelChartsSectionProps> = ({
    data,
}) => {
    const projectsPopulationChartPayload = {
        categories:
            data?.charts.populationByProject.map((item) => item.serviceId) ??
            [],
        series: [
            {
                name: 'Requeridos',
                data:
                    data?.charts.populationByProject.map(
                        (item) => item.required,
                    ) ?? [],
            },
            {
                name: 'Confirmados',
                data:
                    data?.charts.populationByProject.map(
                        (item) => item.confirmed,
                    ) ?? [],
            },
            {
                name: 'Propuestos',
                data:
                    data?.charts.populationByProject.map(
                        (item) => item.proposed,
                    ) ?? [],
            },
        ],
    }

    const servicesSetupChartPayload = {
        categories:
            data?.charts.serviceSchedule.map((item) => item.month) ?? [],
        series: [
            {
                name: 'Requeridos',
                data:
                    data?.charts.serviceSchedule.map((item) => item.required) ??
                    [],
            },
            {
                name: 'Confirmados',
                data:
                    data?.charts.serviceSchedule.map(
                        (item) => item.confirmed,
                    ) ?? [],
            },
            {
                name: 'Propuestos',
                data:
                    data?.charts.serviceSchedule.map((item) => item.proposed) ??
                    [],
            },
        ],
    }

    return (
        <div className="flex flex-col md:flex-row w-full gap-4">
            <AdaptiveCard className="flex-1">
                <ProjectsPanelProjectsPopulationChart
                    data={projectsPopulationChartPayload.series}
                    categories={projectsPopulationChartPayload.categories}
                />
            </AdaptiveCard>

            <AdaptiveCard className="flex-1">
                <ProjectsPanelServicesSetupChart
                    data={servicesSetupChartPayload.series}
                    categories={servicesSetupChartPayload.categories}
                />
            </AdaptiveCard>
        </div>
    )
}

export default ProjectsPanelChartsSection
