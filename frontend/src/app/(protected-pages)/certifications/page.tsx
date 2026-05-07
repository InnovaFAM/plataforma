import CertificationsHeader from './_components/CertificationsHeader'
import CertificationsContent from './_components/CertificationsContent'
import { canViewSectionServer } from '@/server/actions/navigation/getAccess'
import { redirect } from 'next/navigation'

export default async function Page() {
    const canViewSection = await canViewSectionServer('p&c.matrix')

    if (!canViewSection) {
        redirect('/home')
        return null
    }
    return (
        <main className="py-4">
            <CertificationsHeader />
            <CertificationsContent />
        </main>
    )
}
