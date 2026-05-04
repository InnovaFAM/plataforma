'use client'
import { Skeleton } from '@/components/ui'

const Loading = () => {
    return (
        <div className="relative flex flex-col gap-4 w-full my-4">
            <div className="grow">
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="flex flex-col gap-4 flex-3 xl:col-span-3">
                        <Skeleton height={380} className="rounded-2xl" />
                        <Skeleton height={400} className="rounded-2xl" />
                        <Skeleton height={300} className="rounded-2xl" />
                    </div>
                    <div className="flex flex-col gap-4 flex-1 2xl:min-w-100">
                        <Skeleton height={500} className="rounded-2xl" />
                        <Skeleton height={350} className="rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loading
