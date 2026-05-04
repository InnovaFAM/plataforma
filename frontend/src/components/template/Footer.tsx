import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { APP_NAME } from '@/constants/app.constant'
import { HEADER_HEIGHT, PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'

export type FooterPageContainerType = 'gutterless' | 'contained'

type FooterProps = {
    pageContainerType: FooterPageContainerType
    className?: string
}

const FooterContent = () => {
    return (
        <div className="flex items-center justify-between flex-auto w-full">
            <span>
                Copyright &copy; {`${new Date().getFullYear()}`}
                <span className="font-semibold">{` ${APP_NAME}`}</span> Derechos reservados.
            </span>
            <div className="">
                {
                    /*
                    <Link
                    className="text-gray"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    Term & Conditions
                </Link>
                <span className="mx-2 text-muted"> | </span>
                <Link
                    className="text-gray"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    Privacy & Policy
                </Link>
                     */
                }
            </div>
        </div>
    )
}

export default function Footer({
    pageContainerType = 'contained',
    className,
}: FooterProps) {
    return (
        <footer
            className={classNames(
                `footer flex flex-auto shrink-0 items-center ${PAGE_CONTAINER_GUTTER_X}`,
                className,
            )}
            style={{ height: HEADER_HEIGHT}}
        >
            {pageContainerType === 'contained' ? (
                <Container>
                    <FooterContent />
                </Container>
            ) : (
                <FooterContent />
            )}
        </footer>
    )
}
