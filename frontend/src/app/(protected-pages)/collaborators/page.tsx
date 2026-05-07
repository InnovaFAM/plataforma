import { canViewSectionServer } from '@/server/actions/navigation/getAccess'
import CollaboratorsContent from './_components/CollaboratorsContent'
import type { PageProps } from '@/@types/common'
import { redirect } from 'next/navigation'

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    const canViewSection = await canViewSectionServer('p&c.collaborators')

    if (!canViewSection) {
        redirect('/home')
        return null
    }
    return (
        <main className="py-4">
            <CollaboratorsContent params={params} />
        </main>
    )
}
