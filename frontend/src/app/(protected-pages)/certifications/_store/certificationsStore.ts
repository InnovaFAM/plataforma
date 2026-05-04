import { create } from 'zustand'

type CertificationsMatrixState = {
    tempRoleMatrix: Set<string> | null
    tempChoreMatrix: Set<string> | null
}

type CertificationsMatrixActions = {
    initRoleMatrix: (matrix: Set<string>) => void
    toggleRoleEntry: (certSk: string, roleSk: string) => void
    clearRoleMatrix: () => void
    initChoreMatrix: (matrix: Set<string>) => void
    toggleChoreEntry: (certSk: string, choreSk: string) => void
    clearChoreMatrix: () => void
}

const initialState: CertificationsMatrixState = {
    tempRoleMatrix: null,
    tempChoreMatrix: null,
}

export const useCertificationsMatrixStore = create<
    CertificationsMatrixState & CertificationsMatrixActions
>((set) => ({
    ...initialState,

    initRoleMatrix: (matrix) => set({ tempRoleMatrix: new Set(matrix) }),

    toggleRoleEntry: (certSk, roleSk) =>
        set((state) => {
            if (!state.tempRoleMatrix) return state
            const next = new Set(state.tempRoleMatrix)
            const key = `${certSk}#${roleSk}`
            next.has(key) ? next.delete(key) : next.add(key)
            return { tempRoleMatrix: next }
        }),

    clearRoleMatrix: () => set({ tempRoleMatrix: null }),

    initChoreMatrix: (matrix) => set({ tempChoreMatrix: new Set(matrix) }),

    toggleChoreEntry: (certSk, choreSk) =>
        set((state) => {
            if (!state.tempChoreMatrix) return state
            const next = new Set(state.tempChoreMatrix)
            const key = `${certSk}#${choreSk}`
            next.has(key) ? next.delete(key) : next.add(key)
            return { tempChoreMatrix: next }
        }),

    clearChoreMatrix: () => set({ tempChoreMatrix: null }),
}))
