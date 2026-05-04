import type { PageProps } from '@/@types/common'
import ServiceDetailsHeader from '../_components/service-details/ServiceDetailsHeader'
import ServiceDetailsContent from '../_components/service-details/ServiceDetailsContent'
import CreateEditServiceHeader from '../_components/edition-creation/ServiceEditionCreationHeader'
import CreateEditServiceContent from '../_components/edition-creation/ServiceEditionCreationContent'

export default async function Page({ params, searchParams }: PageProps) {
    const pageParams = await params
    const pageSearchParams = await searchParams
    const { slug } = pageParams
    const view = pageSearchParams.view

    return (
        <main className='pt-4'>
            {view === 'edit' ? (
                <>
                    <CreateEditServiceHeader mode="edit" />
                    <CreateEditServiceContent />
                </>
            ) : (
                <>
                    <ServiceDetailsHeader
                        serviceId={decodeURIComponent(slug) as string}
                    />
                    <ServiceDetailsContent
                        serviceId={decodeURIComponent(slug) as string}
                    />
                </>
            )}
        </main>
    )
}
