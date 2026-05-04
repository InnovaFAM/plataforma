import CollaboratorsContent from './_components/CollaboratorsContent'
import type { PageProps } from '@/@types/common'

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams
    return (
        <main className="py-4">
            <CollaboratorsContent params={params} />
        </main>
    )
}
