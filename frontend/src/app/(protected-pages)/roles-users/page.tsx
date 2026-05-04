import RolesUsersContent from './_components/RolesUsersContent'
import RolesUsersHeader from './_components/RolesUsersHeader'
import type { PageProps } from '@/@types/common'

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    return (
        <main className="py-4">
            <RolesUsersHeader />
            <RolesUsersContent params={params} />
        </main>
    )
}
