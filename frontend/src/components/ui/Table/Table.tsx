import classNames from 'classnames'
import type {
    ComponentPropsWithRef,
    CSSProperties,
    ElementType,
    Ref,
} from 'react'

export interface TableProps extends ComponentPropsWithRef<'table'> {
    asElement?: ElementType
    cellBorder?: boolean
    compact?: boolean
    hoverable?: boolean
    overflow?: boolean
    bodyMinHeight?: string | number
    bodyMaxHeight?: string | number
    scrollContainerRef?: Ref<HTMLDivElement>
}

const Table = (props: TableProps) => {
    const {
        asElement: Component = 'table',
        cellBorder,
        bodyMinHeight,
        bodyMaxHeight,
        children,
        className,
        compact = false,
        hoverable = true,
        overflow = true,
        scrollContainerRef,
        ref,
        ...rest
    } = props

    const tableClass = classNames(
        Component === 'table' ? 'table-default' : 'table-flex',
        hoverable && 'table-hover',
        compact && 'table-compact',
        cellBorder && 'table-border',
        bodyMinHeight && 'table-scrollable-body',
        bodyMaxHeight && 'table-scrollable-body',
        className,
    )

    return (
        <div
            ref={scrollContainerRef}
            className={classNames(
                overflow && 'overflow-x-auto overscroll-x-contain',
            )}
        >
            <Component
                className={tableClass}
                {...rest}
                ref={ref}
                style={{
                    ...rest.style,
                    ...(bodyMinHeight &&
                        ({
                            '--table-tbody-min-height':
                                typeof bodyMinHeight === 'number'
                                    ? `${bodyMinHeight}px`
                                    : bodyMinHeight,
                        } as CSSProperties)),
                    ...(bodyMaxHeight &&
                        ({
                            '--table-tbody-max-height':
                                typeof bodyMaxHeight === 'number'
                                    ? `${bodyMaxHeight}px`
                                    : bodyMaxHeight,
                        } as CSSProperties)),
                }}
            >
                {children}
            </Component>
        </div>
    )
}

export default Table