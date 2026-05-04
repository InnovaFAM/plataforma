'use client'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { useCurrentUserAccess } from '@/utils/hooks/useCurrentUserAccess'
import HomeContent from './_components/HomeContent'

const Page = () => {
    const user = useCurrentUserAccess()
    console.log(user)
    return (
        <>
            <HomeContent />
        </>
    )
}

export default Page
