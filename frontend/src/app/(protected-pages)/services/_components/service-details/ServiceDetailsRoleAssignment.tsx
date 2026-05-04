import { getDayJsDate } from '@/components/ui/TimeInput/utils/getDayJsDate'
import { TServiceRole } from '../../types'
import useTranslation from '@/utils/hooks/useTranslation'
import React from 'react'
import classNames from '@/utils/classNames'
import { TbRecharging, TbCopyCheck, TbArrowDownToArc } from 'react-icons/tb'
import ServiceDetailsRoleAssignmentTable from './ServiceDetailsRoleAssignmentTable'
import ServiceDetailsRoleAssignmentTableTools from './ServiceDetailsRoleAssignmentTableTools'

interface ServiceDetailsRoleAssignmentProps {
    selectedRole?: TServiceRole
}

const ServiceDetailsRoleAssignment = ({
    selectedRole,
}: ServiceDetailsRoleAssignmentProps) => {
    const t = useTranslation()

    const Card = (
        title: string,
        value: string,
        icon: React.ReactNode,
        color: string,
    ) => (
        <div
            className={classNames(
                'rounded-2xl p-4 flex flex-col items-start',
                color,
            )}
        >
            <span className="text-sm text-black font-bold">{title}</span>
            <div className="flex justify-between items-center w-full h-12 mt-1">
                <span className="text-4xl font-bold text-black self-end">
                    {value}
                </span>
                <span className="bg-black text-white rounded-full p-3 self-start transform -translate-y-2">
                    {icon}
                </span>
            </div>
        </div>
    )
    return (
        <div className="flex flex-col gap-4 min-h-[80vh] md:min-h-0 h-auto md:h-[80vh]">
            <div className="flex-none mb-4">
                <h4 className="font-bold mt-1">{selectedRole?.roleName}</h4>
                <p className="text-gray-500">
                    {`${getDayJsDate(selectedRole?.startedAt, 'DD/MM/YYYY')} – ${getDayJsDate(selectedRole?.endedAt, 'DD/MM/YYYY')}`}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-none">
                {Card(
                    t('services.details.required'),
                    selectedRole?.required?.toString() || '0',
                    <TbRecharging size={24} />,
                    'bg-blue-100',
                )}
                {Card(
                    t('services.details.confirmed'),
                    selectedRole?.confirmed?.toString() || '0',
                    <TbCopyCheck size={24} />,
                    'bg-green-100',
                )}
                {Card(
                    t('services.details.proposed'),
                    selectedRole?.proposed?.toString() || '0',
                    <TbArrowDownToArc size={24} />,
                    'bg-yellow-200',
                )}
            </div>
            <div className="flex-none">
                <ServiceDetailsRoleAssignmentTableTools />
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
                <ServiceDetailsRoleAssignmentTable
                    fixedPagination
                    selectedRole={selectedRole}
                />
            </div>
        </div>
    )
}

export default ServiceDetailsRoleAssignment
