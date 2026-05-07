import { canViewSectionServer } from '@/server/actions/navigation/getAccess'
import RolesUsersContent from './_components/RolesUsersContent'
import RolesUsersHeader from './_components/RolesUsersHeader'
import type { PageProps } from '@/@types/common'
import { redirect } from 'next/navigation'

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    const canViewSection = await canViewSectionServer('admin.rolesUsers')

    if (!canViewSection) {
        redirect('/home')
        return null
    }
    return (
        <main className="py-4">
            <RolesUsersHeader />
            <RolesUsersContent params={params} />
        </main>
    )
}
