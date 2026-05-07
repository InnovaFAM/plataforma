import ServiceListHeader from './_components/ServicesListHeader'
import ServiceListContent from './_components/ServicesListContent'
import type { PageProps } from '@/@types/common'
import { canViewSectionServer } from '@/server/actions/navigation/getAccess'
import { redirect } from 'next/navigation'

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    const canViewSection = await canViewSectionServer('projects.services')

    if (!canViewSection) {
        redirect('/home')
        return null
    }

    return (
        <main>
            <ServiceListHeader />
            <ServiceListContent params={params} />
        </main>
    )
}
