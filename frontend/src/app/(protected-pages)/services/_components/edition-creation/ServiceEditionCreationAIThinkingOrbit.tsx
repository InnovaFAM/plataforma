import { useEffect, useRef } from 'react'
import useTranslation from '@/utils/hooks/useTranslation'

export type AIThinkingPhase = 'loading' | 'success' | 'idle'

interface AIThinkingOrbitProps {
    phase: AIThinkingPhase
    completedCount?: number
}

const STYLE_ID = 'ai-thinking-orbit-styles'

const keyframes = `
@keyframes aito-orbit1 {
    from { transform: rotate(0deg)   translateX(52px) rotate(0deg);    }
    to   { transform: rotate(360deg) translateX(52px) rotate(-360deg); }
}
@keyframes aito-orbit2 {
    from { transform: rotate(120deg) translateX(72px) rotate(-120deg); }
    to   { transform: rotate(480deg) translateX(72px) rotate(-480deg); }
}
@keyframes aito-orbit3 {
    from { transform: rotate(240deg) translateX(72px) rotate(-240deg); }
    to   { transform: rotate(600deg) translateX(72px) rotate(-600deg); }
}
@keyframes aito-orbit4 {
    from { transform: rotate(60deg)  translateX(94px) rotate(-60deg);  }
    to   { transform: rotate(420deg) translateX(94px) rotate(-420deg); }
}
@keyframes aito-orbit5 {
    from { transform: rotate(180deg) translateX(94px) rotate(-180deg); }
    to   { transform: rotate(540deg) translateX(94px) rotate(-540deg); }
}
@keyframes aito-orbit6 {
    from { transform: rotate(300deg) translateX(94px) rotate(-300deg); }
    to   { transform: rotate(660deg) translateX(94px) rotate(-660deg); }
}
@keyframes aito-inner-spin {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
}
@keyframes aito-ring-cw {
    from { transform: rotate(0deg);    }
    to   { transform: rotate(360deg);  }
}
@keyframes aito-ring-ccw {
    from { transform: rotate(0deg);    }
    to   { transform: rotate(-360deg); }
}
@keyframes aito-core-pulse {
    0%, 100% { transform: scale(1);    }
    50%       { transform: scale(1.1); }
}
@keyframes aito-float {
    0%, 100% { transform: translateY(0px);  }
    50%       { transform: translateY(-6px); }
}
@keyframes aito-msg-fade {
    0%   { opacity: 0; transform: translateY(8px);  }
    18%  { opacity: 1; transform: translateY(0);    }
    82%  { opacity: 1; transform: translateY(0);    }
    100% { opacity: 0; transform: translateY(-8px); }
}
@keyframes aito-success-in {
    0%   { opacity: 0; transform: scale(0.75) translateY(12px); }
    65%  { transform: scale(1.04) translateY(-2px);             }
    100% { opacity: 1; transform: scale(1) translateY(0);       }
}
@keyframes aito-tick {
    from { stroke-dashoffset: 32; }
    to   { stroke-dashoffset: 0;  }
}
@keyframes aito-glow-ring {
    0%, 100% { opacity: 0.5; transform: scale(1);    }
    50%       { opacity: 0;   transform: scale(1.25); }
}
@keyframes aito-bar-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
}
@keyframes aito-dot-bounce {
    0%, 100% { transform: scaleY(0.6); opacity: 0.4; }
    50%       { transform: scaleY(1.4); opacity: 1;   }
}
`

function injectStyles() {
    if (typeof document === 'undefined') return
    if (document.getElementById(STYLE_ID)) return
    const el = document.createElement('style')
    el.id = STYLE_ID
    el.textContent = keyframes
    document.head.appendChild(el)
}

const DOTS = [
    { anim: 'aito-orbit1', dur: '4s', size: 10, color: '#63cab7' },
    { anim: 'aito-orbit2', dur: '6.5s', size: 8, color: '#818cf8' },
    { anim: 'aito-orbit3', dur: '6.5s', size: 7, color: '#f59e0b' },
    { anim: 'aito-orbit4', dur: '9s', size: 9, color: '#f472b6' },
    { anim: 'aito-orbit5', dur: '9s', size: 6, color: '#34d399' },
    { anim: 'aito-orbit6', dur: '9s', size: 7, color: '#fb923c' },
]

const RING_RADII = [94, 72, 52]

function OrbitalSystem({ phase }: { phase: AIThinkingPhase }) {
    const isLoading = phase === 'loading'
    const isSuccess = phase === 'success'

    return (
        <div
            style={{
                position: 'relative',
                width: 220,
                height: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'aito-float 4s ease-in-out infinite',
            }}
        >
            {RING_RADII.map((r, i) => (
                <div
                    key={r}
                    style={{
                        position: 'absolute',
                        width: r * 2,
                        height: r * 2,
                        borderRadius: '50%',
                        border: `1px ${i === 0 ? 'solid' : 'dashed'} rgba(0,0,0,${isLoading ? 0.1 : 0.04})`,
                        animation: isLoading
                            ? `${i % 2 === 0 ? 'aito-ring-cw' : 'aito-ring-ccw'} ${20 + i * 8}s linear infinite`
                            : 'none',
                        transition: 'border-color 0.5s',
                    }}
                />
            ))}

            {isLoading && (
                <svg
                    style={{
                        position: 'absolute',
                        width: 220,
                        height: 220,
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                    }}
                    viewBox="0 0 220 220"
                >
                    <circle
                        cx="110"
                        cy="110"
                        r="52"
                        fill="none"
                        stroke="#63cab720"
                        strokeWidth="1.5"
                        strokeDasharray="8 6"
                    />
                    <circle
                        cx="110"
                        cy="110"
                        r="72"
                        fill="none"
                        stroke="#818cf820"
                        strokeWidth="1.5"
                        strokeDasharray="6 8"
                    />
                    <circle
                        cx="110"
                        cy="110"
                        r="94"
                        fill="none"
                        stroke="#f59e0b18"
                        strokeWidth="1.5"
                        strokeDasharray="4 10"
                    />
                </svg>
            )}

            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {DOTS.map((d) => (
                        <div
                            key={d.anim}
                            style={{
                                position: 'absolute',
                                animation: `${d.anim} ${d.dur} linear infinite`,
                            }}
                        >
                            <div
                                style={{
                                    width: d.size,
                                    height: d.size,
                                    borderRadius: '50%',
                                    background: d.color,
                                    boxShadow: `0 0 ${d.size * 2}px ${d.color}99`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderTopColor: '#63cab7',
                        borderRightColor: '#818cf8',
                        animation: 'aito-inner-spin 1.5s linear infinite',
                        zIndex: 9,
                    }}
                />
            )}

            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        width: 88,
                        height: 88,
                        borderRadius: '50%',
                        border: '1px solid #63cab7',
                        animation: 'aito-glow-ring 2s ease-out infinite',
                        zIndex: 8,
                    }}
                />
            )}

            <div
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    zIndex: 10,
                    background: isSuccess
                        ? 'linear-gradient(135deg, #34d399, #63cab7)'
                        : isLoading
                          ? 'linear-gradient(135deg, #18181b, #27272a)'
                          : '#f4f4f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isLoading
                        ? 'aito-core-pulse 2s ease-in-out infinite'
                        : 'none',
                    boxShadow: isSuccess
                        ? '0 0 0 8px rgba(52,211,153,0.15), 0 0 32px rgba(52,211,153,0.35)'
                        : isLoading
                          ? '0 0 0 8px rgba(24,24,27,0.08), 0 0 30px rgba(0,0,0,0.15)'
                          : '0 0 0 6px rgba(0,0,0,0.05)',
                    transition: 'all 0.6s ease',
                }}
            >
                {isSuccess ? (
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path
                            d="M8 16l6 6 10-12"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="32"
                            style={{
                                animation: 'aito-tick 0.45s 0.1s ease both',
                            }}
                        />
                    </svg>
                ) : (
                    <span style={{ fontSize: 28, userSelect: 'none' }}>✦</span>
                )}
            </div>
        </div>
    )
}

const LOADING_MESSAGES = [
    'services.creation.createWithAiModal.loadingMessage3',
    'services.creation.createWithAiModal.loadingMessage1',
    'services.creation.createWithAiModal.loadingMessage2',
] as const

export default function AIThinkingOrbit({
    phase,
    completedCount = 0,
}: AIThinkingOrbitProps) {
    const t = useTranslation()
    const msgIndexRef = useRef(0)
    const msgKeyRef = useRef(0)

    injectStyles()

    const isLoading = phase === 'loading'
    const isSuccess = phase === 'success'

    useEffect(() => {
        if (!isLoading) return
        msgIndexRef.current = 0
        msgKeyRef.current = 0

        const interval = setInterval(() => {
            if (msgIndexRef.current < LOADING_MESSAGES.length - 1) {
                msgIndexRef.current += 1
                msgKeyRef.current += 1
                document.dispatchEvent(new CustomEvent('aito-msg-tick'))
            }
        }, 2600)

        return () => clearInterval(interval)
    }, [isLoading])

    const [, forceUpdate] = useReducer((x: number) => x + 1, 0)
    useEffect(() => {
        const handler = () => forceUpdate()
        document.addEventListener('aito-msg-tick', handler)
        return () => document.removeEventListener('aito-msg-tick', handler)
    }, [])

    const currentMsgKey = isLoading
        ? LOADING_MESSAGES[msgIndexRef.current]
        : null

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 28,
                padding: '24px 0 8px',
                width: '100%',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: isSuccess
                        ? 'linear-gradient(90deg, #34d399, #63cab7)'
                        : 'linear-gradient(90deg, #818cf8, #63cab7, #f59e0b)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'background 0.6s ease',
                }}
            />

            <OrbitalSystem phase={phase} />

            {isLoading && <ProgressBar />}

            <div
                style={{
                    minHeight: 64,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                }}
            >
                {isLoading && currentMsgKey && (
                    <div
                        key={msgKeyRef.current}
                        style={{
                            animation: 'aito-msg-fade 2.6s ease both',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                marginBottom: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: '#63cab7',
                                    boxShadow: '0 0 8px #63cab7',
                                    flexShrink: 0,
                                }}
                            />
                            <span
                                style={{
                                    color: '#52525b',
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                }}
                            >
                                {t(currentMsgKey)}
                            </span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 5,
                            }}
                        >
                            {LOADING_MESSAGES.map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        height: 2,
                                        borderRadius: 2,
                                        background:
                                            i === msgIndexRef.current
                                                ? '#818cf8'
                                                : '#e4e4e7',
                                        width:
                                            i === msgIndexRef.current ? 24 : 8,
                                        transition: 'all 0.35s ease',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {isSuccess && (
                    <div
                        style={{
                            animation: 'aito-success-in 0.55s ease both',
                            textAlign: 'center',
                            maxWidth: 320,
                        }}
                    >
                        <p
                            style={{
                                color: '#059669',
                                fontSize: 14,
                                fontWeight: 600,
                                lineHeight: 1.6,
                                marginBottom: 8,
                            }}
                        >
                            {t(
                                'services.creation.createWithAiModal.successMessage',
                                {
                                    count: completedCount,
                                },
                            )}
                        </p>
                        <p
                            style={{
                                color: '#a1a1aa',
                                fontSize: 12,
                                lineHeight: 1.7,
                            }}
                        >
                            {t(
                                'services.creation.createWithAiModal.validateInfo',
                            )}
                        </p>
                    </div>
                )}
            </div>

            {isLoading && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        height: 20,
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: 4,
                                height: 16,
                                borderRadius: 3,
                                background: '#d1d5db',
                                animation: `aito-dot-bounce 1s ${i * 0.15}s infinite ease-in-out`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

import { useReducer, useState } from 'react'

function ProgressBar() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        setProgress(0)
        const t = setInterval(
            () => setProgress((p) => (p >= 100 ? 100 : p + 1.3)),
            1000,
        )
        return () => clearInterval(t)
    }, [])

    return (
        <div
            style={{
                width: '100%',
                height: 3,
                background: '#f1f5f9',
                borderRadius: 4,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${progress}%`,
                    borderRadius: 4,
                    transition: 'width 0.1s linear',
                    background:
                        'linear-gradient(90deg, #818cf8, #63cab7, #818cf8)',
                    backgroundSize: '200% auto',
                    animation: 'aito-bar-shimmer 2s linear infinite',
                    boxShadow: '0 0 8px rgba(99,202,183,0.5)',
                }}
            />
        </div>
    )
}
