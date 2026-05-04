import CertificationsHeader from './_components/CertificationsHeader'
import CertificationsContent from './_components/CertificationsContent'

export default async function Page() {
    return (
        <main className="py-4">
            <CertificationsHeader />
            <CertificationsContent />
        </main>
    )
}
