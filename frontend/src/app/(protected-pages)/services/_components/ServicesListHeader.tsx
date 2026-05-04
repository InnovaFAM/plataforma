'use client'
import Button from '@/components/ui/Button'
import useTranslation from '@/utils/hooks/useTranslation'
import Link from 'next/link'

const ServicesListHeader = () => {
    const t = useTranslation()

    return (
        <>
            <div className="flex items-center justify-between gap-4 pt-4">
                <h3>{t('services.header.title')}</h3>
                <div>
                    <Link href="/services/create">
                        <Button variant="solid">
                            {t('services.header.createButton')}
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default ServicesListHeader
