import { canViewSectionServer } from '@/server/actions/navigation/getAccess'
import BackOfficeContent from './_components/BackofficeContent'
import BackOfficeHeader from './_components/BackofficeHeader'
import { redirect } from 'next/navigation'

export default async function Page() {
    const canViewSection = await canViewSectionServer('backOffice')

    if (!canViewSection) {
        redirect('/home')
        return null
    }
    return (
        <main className="py-4">
            <BackOfficeHeader />
            <BackOfficeContent />
        </main>
    )
}
