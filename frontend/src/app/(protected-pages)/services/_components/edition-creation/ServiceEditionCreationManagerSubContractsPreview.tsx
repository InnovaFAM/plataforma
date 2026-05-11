'use client'
import classNames from '@/utils/classNames'
import useTranslation from '@/utils/hooks/useTranslation'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import {
    TContractManager,
    TDetailedService,
    TSubContractManager,
} from '../../types'
import getContractAdminTypeText from '../../_utils/getContractAdminTypeText'
import dayjs from 'dayjs'

interface ServiceManagersPreviewProps {
    serviceData: Pick<TDetailedService, 'managers' | 'submanagers'>
}

const ServiceManagersPreview = ({
    serviceData,
}: ServiceManagersPreviewProps) => {
    const t = useTranslation()
    const { managers = [], submanagers = [] } = serviceData

    const renderManagerCard = (
        admin: TSubContractManager | TContractManager,
        index: number,
        isSubcontract = false,
    ) => {
        const typeColor =
            (admin as TContractManager).type === 'cliente'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-emerald-100 text-emerald-700'

        return (
            <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <span
                            className="font-bold text-gray-800 truncate"
                            title={admin.name}
                        >
                            {admin.name}
                        </span>
                        {(admin as TContractManager).type && !isSubcontract ? (
                            <span
                                className={classNames(
                                    'text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase',
                                    typeColor,
                                )}
                            >
                                {getContractAdminTypeText(
                                    (admin as TContractManager).type,
                                    t,
                                )}
                            </span>
                        ) : null}
                    </div>
                    <span className="text-sm text-gray-500 truncate">
                        {(admin as TContractManager).role}
                    </span>
                    <div className="flex flex-col mt-1 text-xs text-gray-400">
                        <span className="truncate">{admin.email}</span>
                        {admin.phoneNumber && <span>{admin.phoneNumber}</span>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AdaptiveCard collapsible className="flex flex-col gap-6">
            <h4 className="font-bold mt-2">
                {t('services.creation.managersAndSubcontracts')}
            </h4>

            {managers.length > 0 && (
                <div className="flex flex-col gap-3 mt-4">
                    <h5 className="font-semibold text-gray-600 border-b pb-2">
                        {t('services.creation.contractAdmins')}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {managers?.map((m, index) =>
                            renderManagerCard(m, index),
                        )}
                    </div>
                </div>
            )}

            {submanagers?.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                    <h5 className="font-semibold text-gray-600 border-b pb-2">
                        {t('services.creation.subContractsAdmin')}
                    </h5>
                    <div className="flex flex-col gap-5">
                        {submanagers?.map((sub, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 shadow-sm bg-white"
                            >
                                <div className="text-sm text-gray-500 flex gap-4">
                                    <span>
                                        <strong>
                                            {t('services.common.startDate')}:
                                        </strong>{' '}
                                        {sub.startDate
                                            ? dayjs(sub.startDate).format(
                                                  'DD/MM/YYYY',
                                              )
                                            : '--'}
                                    </span>
                                    <span>
                                        <strong>
                                            {t('services.common.endDate')}:
                                        </strong>{' '}
                                        {sub.endDate
                                            ? dayjs(sub.endDate).format(
                                                  'DD/MM/YYYY',
                                              )
                                            : '--'}
                                    </span>
                                </div>

                                {sub.contractManagers?.length > 0 && (
                                    <div className="mt-2 bg-gray-50/50 p-3 rounded-lg border border-dashed border-gray-200">
                                        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                                            {t(
                                                'services.creation.subContractsAdmins',
                                            )}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {sub.contractManagers.map(
                                                (m, idx) =>
                                                    renderManagerCard(
                                                        m,
                                                        idx,
                                                        true,
                                                    ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdaptiveCard>
    )
}

export default ServiceManagersPreview
