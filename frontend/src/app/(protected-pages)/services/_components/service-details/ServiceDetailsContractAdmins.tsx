import Table from '@/components/ui/Table'
import useTranslation from '@/utils/hooks/useTranslation'
import { TContractManager } from '../../types'
import { Button, Skeleton, Tag } from '@/components/ui'
import getContractAdminTypeText from '../../_utils/getContractAdminTypeText'
import { TbPencil, TbTrash } from 'react-icons/tb'
const { Tr, Th, Td, THead, TBody } = Table

interface ServiceDetailsContractAdminsProps {
    admins: TContractManager[]
    onAddAdmin?: () => void
    onEdit?: (admin: TContractManager) => void
    onRemove?: (admin: TContractManager) => void
    isLoading?: boolean
}

const ServiceDetailsContractAdmins = ({
    admins,
    onAddAdmin,
    onEdit,
    onRemove,
    isLoading = false,
}: ServiceDetailsContractAdminsProps) => {
    const t = useTranslation()

    const ActionColumn = ({
        onEdit,
        onRemove,
    }: {
        onEdit: () => void
        onRemove: () => void
    }) => {
        return (
            <div className="flex items-center justify-start gap-4">
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={onEdit}
                >
                    <TbPencil />
                </div>
                <div
                    className={`text-xl cursor-pointer select-none font-semibold`}
                    role="button"
                    onClick={() => {
                        onRemove()
                    }}
                >
                    <TbTrash />
                </div>
            </div>
        )
    }

    return (
        <div className="pb-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">
                    {t('services.details.contractAdmins')}
                </h4>
                {onAddAdmin && (
                    <Button onClick={onAddAdmin} size="sm">
                        {t('common.add')}
                    </Button>
                )}
            </div>
            <Table>
                <THead>
                    <Tr>
                        <Th>{t('services.details.table.name')}</Th>
                        <Th>{t('services.details.table.email')}</Th>
                        <Th>{t('services.details.table.phone')}</Th>
                        <Th>{t('services.details.table.type')}</Th>
                        <Th>{t('services.details.table.role')}</Th>
                        <Th>{t('services.details.table.actions')}</Th>
                    </Tr>
                </THead>
                <TBody>
                    {isLoading ? (
                        <Tr>
                            <Td colSpan={6} className="text-center py-4">
                                <div>
                                    <Skeleton className="mb-4 w-full h-6" />
                                    <Skeleton className="mb-4 w-full h-6" />
                                    <Skeleton className="mb-4 w-full h-6" />
                                    <Skeleton className="mb-4 w-full h-6" />
                                    <Skeleton className="mb-4 w-full h-6" />
                                </div>
                            </Td>
                        </Tr>
                    ) : null}
                    {admins.length === 0 && !isLoading ? (
                        <Tr>
                            <Td colSpan={6} className="text-center py-4">
                                {t('services.details.noContractAdmins')}
                            </Td>
                        </Tr>
                    ) : admins.length && !isLoading ? (
                        admins.map((admin, i) => (
                            <Tr key={i}>
                                <Td>
                                    <p className="line-clamp-2 text-ellipsis overflow-hidden">
                                        {admin.name || '--'}
                                    </p>
                                </Td>
                                <Td>
                                    <p
                                        className="line-clamp-2 text-ellipsis overflow-hidden cursor-pointer"
                                        onClick={() => {
                                            if (admin.email) {
                                                window.location.href = `mailto:${admin.email}`
                                            }
                                        }}
                                    >
                                        {admin.email || '--'}
                                    </p>
                                </Td>
                                <Td>
                                    <p className="line-clamp-2 text-ellipsis overflow-hidden">
                                        {admin.phoneNumber || '--'}
                                    </p>
                                </Td>
                                <Td>
                                    {admin.type ? (
                                        <Tag>
                                            <p className="line-clamp-2 text-ellipsis overflow-hidden">
                                                {getContractAdminTypeText(
                                                    admin.type,
                                                    t,
                                                )}
                                            </p>
                                        </Tag>
                                    ) : (
                                        '--'
                                    )}
                                </Td>
                                <Td>
                                    <p className="line-clamp-2 text-ellipsis overflow-hidden">
                                        {admin.role || '--'}
                                    </p>
                                </Td>
                                <Td>
                                    <ActionColumn
                                        onEdit={() => {
                                            if (onEdit) {
                                                onEdit(admin)
                                            }
                                        }}
                                        onRemove={() => {
                                            if (onRemove) {
                                                onRemove(admin)
                                            }
                                        }}
                                    />
                                </Td>
                            </Tr>
                        ))
                    ) : null}
                </TBody>
            </Table>
        </div>
    )
}

export default ServiceDetailsContractAdmins
