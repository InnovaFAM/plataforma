'use client'

import { useServicesStore } from '../_store/servicesStore'
import { useEffect, useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ServicesListTable from './ServicesListTable'
import ServicesListTableTools from './ServicesListTableTools'
import useTranslation from '@/utils/hooks/useTranslation'
import { useQuery } from '@tanstack/react-query'
import { listServices } from '@/server/actions/services/list-services'
import { serviceKeys } from '@/server/actions/services/service-keys'
import { TService } from '../types'
import RecentVisitedServiceCard from './RecentvisitedServiceCard'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'

interface ServicesListContentProps {
    params: { [key: string]: string | string[] | undefined }
}

const ServicesListContent = ({ params }: ServicesListContentProps) => {
    const { protectedQueryFn } = useProtectedQueryFn()
    const t = useTranslation()
    const [hasMounted, setHasMounted] = useState(false)

    const { data } = useQuery({
        queryKey: serviceKeys.listServices(),
        queryFn: async () => protectedQueryFn(() => listServices()),
    })
    const serviceList = data?.data
    const { setFilterData } = useServicesStore()

    const recentVisitedServiceIds: string[] = useMemo(() => {
        if (typeof window === 'undefined') return []
        const item = localStorage.getItem('recently-visited-services')
        return item ? JSON.parse(item) : []
    }, [])

    const recentVisitedServices: TService[] = useMemo(() => {
        return serviceList?.items?.length
            ? serviceList.items.filter((service) =>
                  recentVisitedServiceIds.includes(service.sk),
              )
            : []
    }, [serviceList?.items, recentVisitedServiceIds])

    const urlFilters = useMemo(() => {
        const decode = (val: string | string[] | undefined) =>
            val ? decodeURIComponent(String(val).replace(/\+/g, ' ')) : ''

        return {
            minDate: decode(params.minDate),
            maxDate: decode(params.maxDate),
            client: decode(params.client),
            faena: decode(params.faena),
            status: params.status ? decode(params.status).split(',') : [],
        }
    }, [params])

    useEffect(() => {
        setHasMounted(true)
        setFilterData(urlFilters)
    }, [urlFilters, setFilterData])

    return (
        <div className="pb-4">
            <div className="mt-8">
                {hasMounted ? (
                    <>
                        {recentVisitedServices.length > 0 && (
                            <h5 className="mb-3">
                                {t('services.list.recentlyVisited')}
                            </h5>
                        )}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recentVisitedServices.map((service) => (
                                <RecentVisitedServiceCard
                                    key={service.sk}
                                    service={service}
                                />
                            ))}
                        </div>
                    </>
                ) : null}
            </div>
            <div className="mt-8">
                {(serviceList?.items?.filter(
                    (service) => !recentVisitedServiceIds.includes(service.sk),
                )?.length ?? 0) > 0 && (
                    <h5 className="mb-3">{t('services.list.allServices')}</h5>
                )}
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <ServicesListTableTools
                            services={serviceList?.items || []}
                        />
                        <ServicesListTable
                            pageSize={parseInt(params.pageSize as string) || 10}
                            searchValue={params.query as string}
                            filters={urlFilters}
                        />
                    </div>
                </AdaptiveCard>
            </div>
        </div>
    )
}

export default ServicesListContent
