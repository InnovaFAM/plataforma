'use client'
import { useState } from 'react'

export const useClickCoolDown = (delay = 500) => {
    const [blocked, setBlocked] = useState(false)

    const trigger = (fn: () => void) => {
        if (blocked) return
        fn()
        setBlocked(true)
        setTimeout(() => setBlocked(false), delay)
    }

    return { blocked, trigger }
}
