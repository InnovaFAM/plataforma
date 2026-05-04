'use client'

import Badge from '@/components/ui/Badge'
import Select, { Option as DefaultOption } from '@/components/ui/Select'
import DebouceInput from '@/components/shared/DebouceInput'
import useAppendQueryParams from '@/utils/hooks/useAppendQueryParams'
import { TbSearch } from 'react-icons/tb'
import { components } from 'react-select'
import type { ControlProps, OptionProps } from 'react-select'
import { useRolesUsersStore } from '../_store/rolesUsersStore'
import getStatusColor from '../_utils/getStatusColor'
import useTranslation from '@/utils/hooks/useTranslation'
import getStatusText from '../_utils/getStatusText'

const { Control } = components

type StatusOption = {
    label: string
    value: string
    dotBackground: string
}

type RoleOption = {
    label: string
    value: string
}

const StatusSelectOption = (props: OptionProps<StatusOption>) => {
    return (
        <DefaultOption<StatusOption>
            {...props}
            customLabel={(data, label) => (
                <span className="flex items-center gap-2">
                    <Badge style={{ background: data.dotBackground }} />
                    <span>{label}</span>
                </span>
            )}
        />
    )
}

const RoleSelectOption = (props: OptionProps<RoleOption>) => {
    return (
        <DefaultOption<RoleOption>
            {...props}
            customLabel={(_, label) => <span>{label}</span>}
        />
    )
}

const CustomControl = ({ children, ...props }: ControlProps<StatusOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <div className="flex ml-3">
                    <Badge style={{ background: selected.dotBackground }} />
                </div>
            )}
            {children}
        </Control>
    )
}

interface RolesUsersTableToolsProps {
    roleOptions: { label: string; value: string }[]
    statusOptions?: string[]
}

const RolesUsersUsersTableTools = ({
    roleOptions,
    statusOptions,
}: RolesUsersTableToolsProps) => {
    const t = useTranslation()
    const filterData = useRolesUsersStore((state) => state.filterData)
    const setFilterData = useRolesUsersStore((state) => state.setFilterData)

    const { onAppendQueryParams } = useAppendQueryParams()

    const handleStatusChange = (status: string) => {
        setFilterData({
            ...filterData,
            status: status as 'activo' | 'inactivo' | 'pendiente',
        })
        onAppendQueryParams({
            status,
        })
    }

    const handleRoleChange = (role: string) => {
        setFilterData({ ...filterData, role })
        onAppendQueryParams({
            role,
        })
    }

    const handleInputChange = (query: string) => {
        onAppendQueryParams({
            query,
        })
    }

    return (
        <div className="flex items-center justify-between">
            <DebouceInput
                className="max-w-[300px]"
                placeholder={t(
                    'rolesUsers.content.userTable.searchPlaceholder',
                )}
                type="text"
                size="sm"
                prefix={<TbSearch className="text-lg" />}
                onChange={(e) => handleInputChange(e.target.value)}
            />
            <div className="flex items-center gap-2">
                <Select<StatusOption, false>
                    instanceId="status"
                    className="min-w-[150px] w-full"
                    components={{
                        Control: CustomControl,
                        Option: StatusSelectOption,
                    }}
                    options={statusOptions?.map((status) => {
                        return {
                            label: status,
                            value: status,
                            dotBackground: getStatusColor(
                                (status as
                                    | 'activo'
                                    | 'inactivo'
                                    | 'pendiente') || '',
                            ),
                        }
                    })}
                    size="sm"
                    placeholder="Status"
                    defaultValue={{
                        label: getStatusText(filterData.status, t),
                        value: '',
                        dotBackground: getStatusColor(),
                    }}
                    value={statusOptions
                        ?.map((status) => ({
                            label: status,
                            value: status,
                            dotBackground: getStatusColor(
                                (status as
                                    | 'activo'
                                    | 'inactivo'
                                    | 'pendiente') || '',
                            ),
                        }))
                        .find((option) => option.value === filterData.status)}
                    onChange={(option) =>
                        handleStatusChange(option?.value || '')
                    }
                />
                <Select<RoleOption>
                    instanceId="role"
                    className="min-w-[150px] w-full"
                    components={{
                        Option: RoleSelectOption,
                    }}
                    options={roleOptions}
                    size="sm"
                    placeholder="Role"
                    defaultValue={{ label: '', value: '' }}
                    value={roleOptions.find(
                        (option) => option.value === filterData.role,
                    )}
                    onChange={(option) => handleRoleChange(option?.value || '')}
                />
            </div>
        </div>
    )
}

export default RolesUsersUsersTableTools
