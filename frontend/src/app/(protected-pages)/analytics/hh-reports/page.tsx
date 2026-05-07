import type { PageProps } from '@/@types/common'
import HHReportsContent from './_components/HHReportsContent'
import { canViewSectionServer } from '@/server/actions/navigation/getAccess'
import { redirect } from 'next/navigation'

export default async function Page({}: PageProps) {
    const canViewSection = await canViewSectionServer('resume.reports')

    if (!canViewSection) {
        redirect('/home')
        return null
    }
    return (
        <main className="py-4">
            <HHReportsContent />
        </main>
    )
}
