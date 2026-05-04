import type { PageProps } from '@/@types/common'
import CollaboratorsAddCertificationHeader from '../_components/add-certification/CollaboratorsAddCertificationHeader'
import CollaboratorsAddCertificationContent from '../_components/add-certification/CollaboratorsAddCertificationContent'
import CollaboratorDetailsHeader from '../_components/collaborator-details/CollaboratorDetailsHeader'
import CollaboratorDetailsContent from '../_components/collaborator-details/CollaboratorDetailsContent'

export default async function Page({ params, searchParams }: PageProps) {
    const pageParams = await params
    const queryParams = await searchParams

    const { slug } = pageParams
    const { view } = queryParams
    return (
        <main className="pt-4">
            {view === 'add-certification' ? (
                <>
                    <CollaboratorsAddCertificationHeader />
                    <CollaboratorsAddCertificationContent
                        collaboratorId={slug}
                    />
                </>
            ) : null}
            {slug && !view ? (
                <>
                    <CollaboratorDetailsHeader collaboratorId={slug} />
                    <CollaboratorDetailsContent collaboratorId={slug} />
                </>
            ) : null}
        </main>
    )
}
