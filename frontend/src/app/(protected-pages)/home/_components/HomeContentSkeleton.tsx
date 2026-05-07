import Card from '@/components/ui/Card'

const SkeletonBlock = ({ className = '' }: { className?: string }) => {
    return (
        <div className={`animate-pulse rounded-md bg-gray-100 ${className}`} />
    )
}

const MetricSkeleton = () => {
    return (
        <div className="text-center">
            <SkeletonBlock className="mx-auto h-7 w-12" />
            <SkeletonBlock className="mx-auto mt-2 h-3 w-20" />
        </div>
    )
}

const RecentSectionSkeleton = () => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <SkeletonBlock className="mb-4 h-10 w-10 rounded-xl" />
            <SkeletonBlock className="h-4 w-24" />
            <div className="mt-3 space-y-2">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-4/5" />
            </div>
            <div className="mt-5 flex items-center justify-between">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-4 w-4 rounded-full" />
            </div>
        </div>
    )
}

const QuickActionSkeleton = () => {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3">
            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-40" />
            </div>

            <SkeletonBlock className="h-4 w-4 rounded-full" />
        </div>
    )
}

const NotificationSkeleton = () => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-xl" />
                <SkeletonBlock className="h-6 w-20 rounded-full" />
            </div>

            <SkeletonBlock className="h-4 w-36" />

            <div className="mt-3 space-y-2">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-5/6" />
            </div>

            <SkeletonBlock className="mt-5 h-3 w-28" />
        </div>
    )
}

export default function HomeContentSkeleton() {
    return (
        <section
            className="w-full px-6 py-6 lg:px-8"
            role="status"
            aria-label="Cargando página de inicio"
        >
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="w-full max-w-2xl">
                            <SkeletonBlock className="mb-3 h-6 w-32 rounded-full" />
                            <SkeletonBlock className="h-8 w-72 md:h-9" />

                            <div className="mt-4 space-y-2">
                                <SkeletonBlock className="h-4 w-full" />
                                <SkeletonBlock className="h-4 w-4/5" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-3">
                            <MetricSkeleton />
                            <MetricSkeleton />
                            <MetricSkeleton />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <Card className="h-full">
                            <div className="p-5">
                                <div className="mb-5">
                                    <SkeletonBlock className="h-5 w-52" />
                                    <SkeletonBlock className="mt-2 h-4 w-72" />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <RecentSectionSkeleton />
                                    <RecentSectionSkeleton />
                                    <RecentSectionSkeleton />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="h-full">
                        <div className="p-5">
                            <div className="mb-5">
                                <SkeletonBlock className="h-5 w-36" />
                                <SkeletonBlock className="mt-2 h-4 w-56" />
                            </div>

                            <div className="flex flex-col gap-3">
                                <QuickActionSkeleton />
                                <QuickActionSkeleton />
                                <QuickActionSkeleton />
                                <QuickActionSkeleton />
                            </div>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="p-5">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <SkeletonBlock className="h-5 w-52" />
                                <SkeletonBlock className="mt-2 h-4 w-80" />
                            </div>

                            <SkeletonBlock className="h-4 w-20" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                        </div>
                    </div>
                </Card>
            </div>

            <span className="sr-only">Cargando...</span>
        </section>
    )
}
