import ServiceListHeader from './_components/ServicesListHeader'
import ServiceListContent from './_components/ServicesListContent'
import type { PageProps } from '@/@types/common'

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams

    return (
        <main>
            <ServiceListHeader />
            <ServiceListContent params={params} />
        </main>
    )
}
