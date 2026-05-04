'use client'

import AdaptiveCard from '@/components/shared/AdaptiveCard'

const ReportsHHProjectionSectionSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                <div className="space-y-2">
                    <div className="h-8 w-72 bg-gray-200 rounded" />
                    <div className="h-4 w-96 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="h-11 w-[220px] bg-gray-200 rounded-xl" />
                    <div className="h-11 w-[180px] bg-gray-200 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <AdaptiveCard key={i}>
                        <div className="space-y-3">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-8 w-32 bg-gray-200 rounded" />
                        </div>
                    </AdaptiveCard>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AdaptiveCard>
                    <div className="h-[420px] bg-gray-100 rounded-xl" />
                </AdaptiveCard>
                <AdaptiveCard>
                    <div className="h-[420px] bg-gray-100 rounded-xl" />
                </AdaptiveCard>
            </div>
        </div>
    )
}

export default ReportsHHProjectionSectionSkeleton
