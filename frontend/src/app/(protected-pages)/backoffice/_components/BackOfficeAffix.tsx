import Affix from '@/components/shared/Affix'
import useTranslation from '@/utils/hooks/useTranslation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Link } from 'react-scroll'

interface BackOfficeAffixProps {
    elements: {
        label: string
        id: string
    }[]
}

const BackOfficeAffix = ({ elements }: BackOfficeAffixProps) => {
    const t = useTranslation()
    const searchParams = useSearchParams()
    const sectionToScroll = searchParams.get('section')

    useEffect(() => {
        if (sectionToScroll) {
            const element = document.getElementById(
                `backOffice_${sectionToScroll}`,
            )
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    })
                }, 100)
            }
        }
    }, [sectionToScroll])

    return (
        <Affix offset={80}>
            <h6 className="heading-text font-bold uppercase tracking-wide mb-3 text-sm lg:text-xs">
                {t('backOffice.affix.title')}
            </h6>
            <ul className="text-gray-500 dark:text-gray-400 font-medium ltr:border-l rtl:border-r border-gray-200 dark:border-gray-700 px-4">
                {elements.map((link) => (
                    <li key={`anchor${link.id}`} className="relative">
                        <Link
                            activeClass="text-gray-900 dark:text-gray-50 after:content-[''] after:absolute after:-left-[18px] after:bg-primary after:w-[3px] after:h-5"
                            className="cursor-pointer block transform transition-colors duration-200 py-2 hover:text-gray-900 dark:hover:text-gray-100"
                            to={link.id}
                            spy={true}
                            smooth={true}
                            duration={500}
                            offset={-80}
                        >
                            {t(link.label)}
                        </Link>
                    </li>
                ))}
            </ul>
        </Affix>
    )
}

export default BackOfficeAffix
