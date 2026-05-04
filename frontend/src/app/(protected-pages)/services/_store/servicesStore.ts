import { create } from 'zustand'
import type {
    Filter,
    RoleAssignmentFilter,
    TDetailedService,
    TService,
    TServiceRole,
    TServiceRoleTemp,
} from '../types'

export const initialFilterData: Filter = {
    minDate: '',
    maxDate: '',
    client: '',
    faena: '',
    status: [],
}

export const initialRoleAssignmentFilterData: RoleAssignmentFilter = {
    status: 'all',
    evaluation: 'all',
    compliance: 'all',
    annexes: 'all',
}

export type ServicesListState = {
    filterData: Filter
    roleAssignmentFilterData: RoleAssignmentFilter
    roleAssignmentSearchValue: string
    roleToUpdate: Partial<TServiceRole>[]
    roleToCreate: TServiceRoleTemp[]
    selectedServices: Partial<TService>[]
    tempService: TDetailedService | null
}

type ServicesListAction = {
    upsertRoleToUpdate: (changedFields: Partial<TServiceRoleTemp>) => void
    upsertRoleToCreate: (changedFields: TServiceRoleTemp) => void
    upsertRolesToCreate: (tempRoles: TServiceRoleTemp[]) => void
    setFilterData: (payload: Filter) => void
    setSelectedServices: (checked: boolean, service: TService) => void
    setSelectAllServices: (services: TService[]) => void
    setTempService: (service: TDetailedService | null) => void
    setRoleToUpdate: (services: TServiceRole[]) => void
    setRoleToCreate: (services: TServiceRole[]) => void
    setRoleAssignmentFilterData: (payload: RoleAssignmentFilter) => void
    setRoleAssignmentSearchValue: (value: string) => void
}

const initialState: ServicesListState = {
    filterData: initialFilterData,
    selectedServices: [],
    tempService: null,
    roleToUpdate: [],
    roleToCreate: [],
    roleAssignmentFilterData: initialRoleAssignmentFilterData,
    roleAssignmentSearchValue: '',
}

export const useServicesStore = create<ServicesListState & ServicesListAction>(
    (set) => ({
        ...initialState,
        setFilterData: (payload) => set(() => ({ filterData: payload })),
        setSelectedServices: (checked, service) =>
            set((state) => {
                const selectedServices = state.selectedServices.slice()
                if (checked) {
                    selectedServices.push(service)
                } else {
                    const index = selectedServices.findIndex(
                        (item) => item.sk === service.sk,
                    )
                    if (index > -1) {
                        selectedServices.splice(index, 1)
                    }
                }
                return { selectedServices: selectedServices }
            }),
        setSelectAllServices: (services) =>
            set(() => ({ selectedServices: services })),
        setTempService: (service) => set(() => ({ tempService: service })),
        setRoleToCreate: (services) => set(() => ({ roleToCreate: services })),
        setRoleToUpdate: (services) => set(() => ({ roleToUpdate: services })),
        setRoleAssignmentFilterData: (payload) =>
            set(() => ({ roleAssignmentFilterData: payload })),
        setRoleAssignmentSearchValue: (value) =>
            set(() => ({ roleAssignmentSearchValue: value })),
        upsertRoleToUpdate: (changedFields: Partial<TServiceRole>) =>
            set((state) => {
                const exists = state.roleToUpdate.some(
                    (role) => role.sk === changedFields.sk,
                )

                return {
                    roleToUpdate: exists
                        ? state.roleToUpdate.map((role) =>
                              role.sk === changedFields.sk
                                  ? { ...role, ...changedFields }
                                  : role,
                          )
                        : [...state.roleToUpdate, changedFields],
                }
            }),
        upsertRoleToCreate: (changedFields: TServiceRoleTemp) =>
            set((state) => {
                const exists = state.roleToCreate.some(
                    (role) => role.sk === changedFields.sk,
                )

                return {
                    roleToCreate: exists
                        ? state.roleToCreate.map((role) =>
                              role.sk === changedFields.sk
                                  ? { ...role, ...changedFields }
                                  : role,
                          )
                        : [...state.roleToCreate, changedFields],
                }
            }),

        upsertRolesToCreate: (tempRoles: TServiceRoleTemp[]) =>
            set((state) => {
                return {
                    roleToCreate: [...state.roleToCreate, ...tempRoles],
                }
            }),
    }),
)
