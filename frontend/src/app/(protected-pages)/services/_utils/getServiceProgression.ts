import dayjs from 'dayjs'

const getServiceProgression = (
    startDate?: string,
    endDate?: string,
): number => {
    if (!startDate || !endDate) {
        return 0
    }

    const normalizeToMidnight = (date: Date): Date => {
        return dayjs(date).startOf('day').toDate()
    }

    const start = normalizeToMidnight(
        dayjs(startDate.substring(0, 10)).toDate(),
    )
    const end = normalizeToMidnight(dayjs(endDate.substring(0, 10)).toDate())
    const now = normalizeToMidnight(dayjs().toDate())

    if (now <= start) {
        return 0
    }
    if (now >= end) {
        return 100
    }

    const totalDuration = end.getTime() - start.getTime()
    const elapsedDuration = now.getTime() - start.getTime()
    return Math.round((elapsedDuration / totalDuration) * 100)
}

export default getServiceProgression
