import useTranslation from '@/utils/hooks/useTranslation'
import { TServiceRole } from '../../types'
import classNames from '@/utils/classNames'
import { TbRecharging, TbCopyCheck, TbArrowDownToArc } from 'react-icons/tb'
import ServiceDetailsContractPayrollTable from './ServiceDetailsContractPayrollTable'
import { useMemo } from 'react'
import Skeleton from '@/components/ui/Skeleton/Skeleton'
import { Button } from '@/components/ui'

interface ServiceDetailsContractPayrollProps {
    roles: TServiceRole[]
    onAddRole: () => void
    isEditMode?: boolean
    onRoleClick?: (roleName: string) => void
    isLoading?: boolean
}

const ServiceDetailsContractPayroll = ({
    roles,
    onRoleClick,
    onAddRole,
    isLoading = false,
}: ServiceDetailsContractPayrollProps) => {
    const t = useTranslation()

    const requiredTotal = useMemo(
        () =>
            roles.reduce(
                (total, role) =>
                    total + (role.required ? parseInt(role.required) || 0 : 0),
                0,
            ),
        [roles],
    )
    const proposedTotal = useMemo(
        () =>
            roles.reduce(
                (total, role) =>
                    total + (role.proposed ? parseInt(role.proposed) || 0 : 0),
                0,
            ),
        [roles],
    )
    const confirmedTotal = useMemo(
        () =>
            roles.reduce(
                (total, role) =>
                    total +
                    (role.confirmed ? parseInt(role.confirmed) || 0 : 0),
                0,
            ),
        [roles],
    )

    const coveredStaffing =
        requiredTotal > 0
            ? Math.round((confirmedTotal / requiredTotal) * 100)
            : 0

    const CARDS = [
        {
            label: t('services.details.coveredStaffing'),
            value: `${coveredStaffing}%`,
            color: 'bg-blue-100',
            icon: <TbRecharging size={24} />,
        },
        {
            label: t('services.details.roles'),
            value: roles.length,
            color: 'bg-green-100',
            icon: <TbCopyCheck size={24} />,
        },
        {
            label: t('services.details.required'),
            value: requiredTotal,
            color: 'bg-purple-100',
            icon: <TbArrowDownToArc size={24} />,
        },
        {
            label: t('services.details.proposed'),
            value: proposedTotal,
            color: 'bg-blue-100',
            icon: <TbRecharging size={24} />,
        },
        {
            label: t('services.details.confirmed'),
            value: confirmedTotal,
            color: 'bg-blue-100',
            icon: <TbRecharging size={24} />,
        },
    ]

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold mt-1 mb-4">
                    {t('services.details.contractPayroll')}
                </h4>
                <Button onClick={onAddRole} size="sm">
                    Agregar Role
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mt-10 mb-6">
                {isLoading
                    ? CARDS.map((_, index) => (
                          <Skeleton
                              key={index}
                              className="w-full h-26 rounded-2xl"
                          />
                      ))
                    : CARDS.map((card, index) => (
                          <div
                              key={index}
                              className={classNames(
                                  'rounded-2xl p-4 flex flex-col items-start',
                                  card.color,
                              )}
                          >
                              <span className="text-sm text-black font-bold">
                                  {card.label}
                              </span>
                              <div className="flex justify-between items-center w-full h-12 mt-1">
                                  <span className="text-4xl font-bold text-black self-end">
                                      {card.value}
                                  </span>
                                  <span className="bg-black text-white rounded-full p-3 self-start transform -translate-y-2">
                                      {card.icon}
                                  </span>
                              </div>
                          </div>
                      ))}
            </div>
            <ServiceDetailsContractPayrollTable
                data={roles}
                onRoleClick={onRoleClick}
                isLoading={isLoading}
            />
        </div>
    )
}

export default ServiceDetailsContractPayroll
