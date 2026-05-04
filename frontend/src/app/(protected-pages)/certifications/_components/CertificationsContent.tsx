'use client'
import GlobalCertificationsTable from './GlobalCertificationsTable'

import { useQuery } from '@tanstack/react-query'

import RoleCertificationsTable from './RoleCertificationsTable'
import ChoreCertificationsTable from './ChoreCertificationsTable'
import CertificationsAffix from './CertificationsAffix'
import useTranslation from '@/utils/hooks/useTranslation'
import { listGlobalCertifications } from '@/server/actions/certifications/list-global-certifications'
import { certificationKeys } from '@/server/actions/certifications/certification-keys'
import { listChoreCertifications } from '@/server/actions/certifications/list-chore-certifications'
import { listRoleCertifications } from '@/server/actions/certifications/list-role-certifications'

const CertificationsContent = () => {
    const t = useTranslation()

    const { data: globalCertifications, isLoading: isLoadingGlobal } = useQuery(
        {
            queryKey: certificationKeys.global,
            queryFn: async () => {
                const response = await listGlobalCertifications()

                if (!response.success) {
                    throw new Error(response.error)
                }

                return response.data
            },
        },
    )

    const { data: choreCertifications, isLoading: isLoadingChore } = useQuery({
        queryKey: certificationKeys.chore,
        queryFn: async () => {
            const response = await listChoreCertifications()

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
    })

    const { data: roleCertifications, isLoading: isLoadingRole } = useQuery({
        queryKey: certificationKeys.role,
        queryFn: async () => {
            const response = await listRoleCertifications()

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
    })

    const NAVIGATION_ELEMENTS = [
        {
            label: 'certifications.navigationItems.global',
            id: 'certifications_global',
        },
        {
            label: 'certifications.navigationItems.role',
            id: 'certifications_roles',
        },
        {
            label: 'certifications.navigationItems.chore',
            id: 'certifications_chores',
        },
    ]

    return (
        <div className="relative flex flex-col gap-4 w-full mt-4">
            <div className="grow">
                <div className="flex flex-col xl:flex-row gap-4">
                    <div className="flex flex-col gap-8 flex-4 xl:col-span-3 min-w-0">
                        <div id={NAVIGATION_ELEMENTS[0].id}>
                            <h4 className="font-bold">
                                {t('certifications.tables.global.title')}
                            </h4>
                            <p className="text-sm text-gray-500 ">
                                {t('certifications.tables.global.description')}
                            </p>
                            <GlobalCertificationsTable
                                data={globalCertifications?.certificates}
                                isLoadingData={isLoadingGlobal}
                            />
                        </div>
                        <div id={NAVIGATION_ELEMENTS[1].id}>
                            <h4 className="font-bold">
                                {t('certifications.tables.role.title')}
                            </h4>
                            <p className="text-sm text-gray-500 ">
                                {t('certifications.tables.role.description')}
                            </p>
                            <RoleCertificationsTable
                                data={roleCertifications}
                                isLoadingData={isLoadingRole}
                            />
                        </div>
                        <div id={NAVIGATION_ELEMENTS[2].id}>
                            <h4 className="font-bold">
                                {t('certifications.tables.chore.title')}
                            </h4>
                            <p className="text-sm text-gray-500 ">
                                {t('certifications.tables.chore.description')}
                            </p>
                            <ChoreCertificationsTable
                                data={choreCertifications}
                                isLoadingData={isLoadingChore}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 min-w-32 sticky top-20 self-start">
                        <CertificationsAffix elements={NAVIGATION_ELEMENTS} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CertificationsContent
