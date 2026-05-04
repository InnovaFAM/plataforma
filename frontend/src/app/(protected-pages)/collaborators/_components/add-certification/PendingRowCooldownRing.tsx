'use client'

import useTranslation from '@/utils/hooks/useTranslation'
import { useEffect, useState } from 'react'

const CooldownRing = ({
    isLastPollPending,
    maxPollRetries,
    pollIntervalMs,
}: {
    isLastPollPending: boolean
    maxPollRetries: number
    pollIntervalMs: number
}) => {
    const t = useTranslation()
    const COOLDOWN_DURATION_MS = maxPollRetries * pollIntervalMs
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        if (isLastPollPending) return
        const start = Date.now()
        const id = setInterval(() => {
            const el = Date.now() - start
            setElapsed(el)
            if (el >= COOLDOWN_DURATION_MS) clearInterval(id)
        }, 200)
        return () => clearInterval(id)
    }, [isLastPollPending, COOLDOWN_DURATION_MS])

    const radius = 11
    const lastRetryRadius = 8
    const circumference = 2 * Math.PI * radius
    const lastRetryCircumference = Math.PI * lastRetryRadius
    const remaining = Math.max(
        0,
        Math.ceil((COOLDOWN_DURATION_MS - elapsed) / 1000),
    )

    if (isLastPollPending) {
        return (
            <div className="flex flex-col items-center justify-center shrink-0 ml-4">
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    className="animate-spin"
                >
                    <circle
                        cx="16"
                        cy="16"
                        r={lastRetryRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                        cx="16"
                        cy="16"
                        r={lastRetryRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray={`${lastRetryCircumference * 0.25} ${lastRetryCircumference * 0.75}`}
                        strokeLinecap="round"
                        transform="rotate(-90 16 16)"
                        className="text-primary"
                    />
                </svg>
                <span className="text-[9px] font-semibold tracking-wide">
                    {t(
                        'collaborators.addCertification.certificatesTable.status.lastRetry',
                    )}
                </span>
            </div>
        )
    }

    const progress = Math.min(elapsed / COOLDOWN_DURATION_MS, 1)
    const dashoffset = circumference * progress

    return (
        <div className="flex flex-col items-center justify-center shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32">
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-gray-200 dark:text-gray-700"
                />
                <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 16 16)"
                    className="text-blue-400 dark:text-blue-500"
                    style={{ transition: 'stroke-dashoffset 0.2s linear' }}
                />
                <text
                    x="16"
                    y="20"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill="currentColor"
                    className="fill-gray-500 dark:fill-gray-400"
                >
                    {remaining}s
                </text>
            </svg>
        </div>
    )
}

export default CooldownRing
