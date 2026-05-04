'use client'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

const useAppendQueryParams = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const onAppendQueryParams = (
        params: Record<string, string | number | boolean | undefined | null>,
    ) => {
        const updatedParams = new URLSearchParams(searchParams.toString())

        Object.entries(params).forEach(([name, value]) => {
            if (value === undefined || value === null || value === '') {
                updatedParams.delete(name)
            } else {
                updatedParams.set(name, String(value))
            }
        })

        const newQueryString = updatedParams.toString()
        router.push(`${pathname}${newQueryString ? `?${newQueryString}` : ''}`)
    }

    return { onAppendQueryParams }
}

export default useAppendQueryParams
