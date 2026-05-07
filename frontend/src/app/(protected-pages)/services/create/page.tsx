import { canServer } from '@/server/actions/navigation/getAccess'
import CreateEditServiceContent from '../_components/edition-creation/ServiceEditionCreationContent'
import CreateEditServiceHeader from '../_components/edition-creation/ServiceEditionCreationHeader'
import { redirect } from 'next/navigation'

export default async function Page() {
    const canCreate = await canServer('services:create')
    if (!canCreate) {
        redirect('/home')
        return null
    }
    return (
        <main>
            <CreateEditServiceHeader mode="create" />
            <CreateEditServiceContent />
        </main>
    )
}
