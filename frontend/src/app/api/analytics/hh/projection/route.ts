import { apiHHProjectionService } from '@/services/AnalyticsService'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    const month = searchParams.get('month') ?? undefined
    const horizonMonthsRaw = searchParams.get('horizonMonths')
    const horizonMonths = horizonMonthsRaw
        ? Number(horizonMonthsRaw)
        : undefined

    const response = await apiHHProjectionService({
        month,
        horizonMonths,
    })

    return NextResponse.json(response)
}
