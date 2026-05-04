import { useState, useRef } from 'react'

export const useDragScroll = () => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    const onMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return
        setIsDragging(true)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const onMouseUp = () => setIsDragging(false)
    const onMouseLeave = () => setIsDragging(false)

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    return {
        scrollRef,
        dragEvents: {
            onMouseDown,
            onMouseUp,
            onMouseLeave,
            onMouseMove,
        },
        isDragging,
    }
}
