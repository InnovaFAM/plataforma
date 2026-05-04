import { apiHHDetailService } from '@/services/AnalyticsService'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    const monthsRaw = searchParams.get('months') ?? ''
    const months = monthsRaw ? monthsRaw.split(',').filter(Boolean) : undefined
    const servicesRaw = searchParams.get('services') ?? ''
    const services = servicesRaw
        ? servicesRaw.split(',').filter(Boolean)
        : undefined

    const response = await apiHHDetailService({
        months,
        services,
    })

    return NextResponse.json(response)
}
