import { create } from 'zustand'
import type { TUser, Filter } from '../types'

export const initialFilterData: Filter = {
    role: '',
    status: 'activo',
}

export type RolesUsersListState = {
    filterData: Filter
    selectedUsers: Partial<TUser>[]
    tempUser: TUser | null
    showCreateModal: boolean
}

type RolesUsersListAction = {
    setFilterData: (payload: Filter) => void
    setSelectedUsers: (checked: boolean, user: TUser) => void
    setSelectAllUsers: (users: TUser[]) => void
    setTempUser: (user: TUser | null) => void
    setShowCreateModal: (show: boolean) => void
}

const initialState: RolesUsersListState = {
    filterData: initialFilterData,
    selectedUsers: [],
    tempUser: null,
    showCreateModal: false,
}

export const useRolesUsersStore = create<
    RolesUsersListState & RolesUsersListAction
>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedUsers: (checked, user) =>
        set((state) => {
            const selectedUsers = state.selectedUsers.slice()
            if (checked) {
                selectedUsers.push(user)
            } else {
                const index = selectedUsers.findIndex(
                    (item) => item.sk === user.sk,
                )
                if (index > -1) {
                    selectedUsers.splice(index, 1)
                }
            }
            return { selectedUsers: selectedUsers }
        }),
    setSelectAllUsers: (users) => set(() => ({ selectedUsers: users })),
    setTempUser: (user) => set(() => ({ tempUser: user })),
    setShowCreateModal: (show) => set(() => ({ showCreateModal: show })),
}))
