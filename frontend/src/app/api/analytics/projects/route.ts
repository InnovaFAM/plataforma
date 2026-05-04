import { apiProjectsService } from '@/services/AnalyticsService'
import { NextRequest, NextResponse } from 'next/server'

const splitParam = (value: string | null) =>
    value ? value.split(',').filter(Boolean) : []

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    const response = await apiProjectsService({
        month: searchParams.get('month') || '',
        statuses: splitParam(searchParams.get('statuses')),
        services: splitParam(searchParams.get('services')),
    })

    return NextResponse.json(response)
}
