'use client'
import { Button, toast, Notification } from '@/components/ui'
import { useCan } from '@/hooks/useCan'
import { projectsAnalyticsKeys } from '@/server/actions/analytics/analytics-keys'
import { exportProjects } from '@/server/actions/analytics/projects-actions'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import useTranslation from '@/utils/hooks/useTranslation'
import { useMutation } from '@tanstack/react-query'
import { TbCloudDownload } from 'react-icons/tb'

const ProjectsPanelHeader = () => {
    const t = useTranslation()
    const { session } = useCurrentSession()
    const canExportReport = useCan('reports:export')

    const exportMutation = useMutation({
        mutationKey: projectsAnalyticsKeys.export,
        mutationFn: () => exportProjects(),
        onSuccess: () => {
            toast.push(
                <Notification type="success">
                    Recibirás en los próximos minutos el informe del panel de
                    proyectos en tu correo {session?.user.email}.
                </Notification>,
            )
        },
        onError: (error) => {
            toast.push(
                <Notification type="danger">
                    Hubo un error al generar el informe del panel de proyectos.{' '}
                    {error.message}
                </Notification>,
            )
        },
    })

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h3>{t('projectsPanel.header.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t('projectsPanel.header.subtitle')}
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    {canExportReport && (
                        <Button
                            variant="default"
                            icon={<TbCloudDownload />}
                            onClick={() => exportMutation.mutate()}
                            loading={exportMutation.isPending}
                            disabled={exportMutation.isPending}
                        >
                            {exportMutation.isPending
                                ? 'Exportando...'
                                : t('projectsPanel.header.exportButton')}
                        </Button>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProjectsPanelHeader
