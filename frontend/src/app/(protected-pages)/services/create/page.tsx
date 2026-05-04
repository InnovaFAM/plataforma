import CreateEditServiceContent from '../_components/edition-creation/ServiceEditionCreationContent'
import CreateEditServiceHeader from '../_components/edition-creation/ServiceEditionCreationHeader'

export default async function Page() {
    return (
        <main>
            <CreateEditServiceHeader mode="create" />
            <CreateEditServiceContent />
        </main>
    )
}
