import type { PageProps } from '@/@types/common'
import HHReportsContent from './_components/HHReportsContent'

export default async function Page({}: PageProps) {
    return (
        <main className="py-4">
            <HHReportsContent />
        </main>
    )
}
