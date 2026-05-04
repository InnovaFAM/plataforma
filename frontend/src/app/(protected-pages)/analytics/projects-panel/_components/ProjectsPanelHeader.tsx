'use client'
import { Button } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TbCloudDownload } from 'react-icons/tb'

const ProjectsPanelHeader = () => {
    const t = useTranslation()

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
                    <Button variant="default" icon={<TbCloudDownload />}>
                        {t('projectsPanel.header.exportButton')}
                    </Button>
                    <Button variant="solid">
                        {t('projectsPanel.header.createButton')}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ProjectsPanelHeader
