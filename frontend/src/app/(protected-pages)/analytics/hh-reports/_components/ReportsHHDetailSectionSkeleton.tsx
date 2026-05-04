'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'

const ReportsHHDetailSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded" />
                <div className="h-4 w-96 bg-gray-200 rounded" />
            </div>

            <AdaptiveCard>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                        <div className="h-11 w-full bg-gray-200 rounded-xl" />
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-11 w-full bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </AdaptiveCard>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <AdaptiveCard key={i}>
                        <div className="space-y-3">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-8 w-24 bg-gray-200 rounded" />
                        </div>
                    </AdaptiveCard>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AdaptiveCard>
                    <div className="space-y-3">
                        <div className="h-6 w-48 bg-gray-200 rounded" />
                        <div className="h-4 w-72 bg-gray-200 rounded" />
                        <div className="h-[300px] bg-gray-100 rounded-xl" />
                    </div>
                </AdaptiveCard>

                <AdaptiveCard>
                    <div className="space-y-3">
                        <div className="h-6 w-40 bg-gray-200 rounded" />
                        <div className="h-4 w-64 bg-gray-200 rounded" />
                        <div className="h-[300px] bg-gray-100 rounded-xl" />
                    </div>
                </AdaptiveCard>
            </div>

            <AdaptiveCard>
                <div className="space-y-4">
                    <div className="h-6 w-52 bg-gray-200 rounded" />
                    <div className="h-[360px] bg-gray-100 rounded-xl" />
                </div>
            </AdaptiveCard>
        </div>
    )
}

export default ReportsHHDetailSectionSkeleton
