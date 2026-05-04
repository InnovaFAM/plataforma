'use client'

import classNames from '@/utils/classNames'
import Card from '@/components/ui/Card'
import useLayout from '@/utils/hooks/useLayout'
import type { CardProps } from '@/components/ui/Card'
import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'

type AdaptableCardProps = CardProps & {
    collapsible?: boolean
}

const AdaptiveCard = (props: AdaptableCardProps) => {
    const { adaptiveCardActive } = useLayout()

    const { className, bodyClass, collapsible, children, ...rest } = props

    const [isCollapsed, setIsCollapsed] = useState(false)
    const toggleCollapse = () => setIsCollapsed(!isCollapsed)

    return (
        <Card
            className={classNames(
                className,
                adaptiveCardActive && 'border-none dark:bg-transparent',
                collapsible &&
                    'overflow-hidden transition-[max-height] duration-300 ease-in-out',
                collapsible && (isCollapsed ? 'max-h-20' : 'max-h-500'),
            )}
            bodyClass={classNames(bodyClass, adaptiveCardActive && 'p-0')}
            {...rest}
        >
            {collapsible ? (
                <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">{children}</div>
                    <button
                        type="button"
                        onClick={toggleCollapse}
                        className="shrink-0 text-gray-500 hover:text-gray-700 p-1 mt-1"
                    >
                        <FaChevronDown
                            size={20}
                            className={classNames(
                                'transition-transform duration-300 text-black',
                                !isCollapsed && 'rotate-180',
                            )}
                        />
                    </button>
                </div>
            ) : (
                children
            )}
        </Card>
    )
}

export default AdaptiveCard
