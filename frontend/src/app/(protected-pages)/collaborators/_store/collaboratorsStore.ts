import { create } from 'zustand'
import type {
    Filter,
    TCertificateRow,
    TCollaboratorCertificate,
    TCollaboratorEntity,
} from '../types'

export const initialFilterData: Filter = {
    role: '',
    assignations: '',
    status: '',
}

export type CollaboratorsListState = {
    filterData: Filter
    selectedCollaborators: Partial<TCollaboratorEntity>[]
    certificateRows: TCertificateRow[]
    selectedCertificate?: TCollaboratorCertificate
    isProcessingAll: boolean
    triggerSaveAll: number
    deletedFileSignatures: string[]
}

type CollaboratorsListAction = {
    setFilterData: (payload: Filter) => void
    setSelectedCollaborators: (
        checked: boolean,
        collaborator: TCollaboratorEntity,
    ) => void
    setSelectAllCollaborators: (collaborators: TCollaboratorEntity[]) => void
    addCertificateRows: (rows: TCertificateRow[]) => void
    updateCertificateRow: (
        tempId: string,
        update: Partial<TCertificateRow>,
    ) => void
    removeCertificateRow: (tempId: string) => void
    setSelectedCertificate: (certificate?: TCollaboratorCertificate) => void
    fireProcessAll: () => void
    setIsProcessingAll: (value: boolean) => void
    fireSaveAll: () => void
}

const initialState: CollaboratorsListState = {
    filterData: initialFilterData,
    selectedCollaborators: [],
    certificateRows: [],
    selectedCertificate: undefined,
    isProcessingAll: false,
    triggerSaveAll: 0,
    deletedFileSignatures: [],
}

export const useCollaboratorsStore = create<
    CollaboratorsListState & CollaboratorsListAction
>((set) => ({
    ...initialState,
    setFilterData: (payload) => set(() => ({ filterData: payload })),
    setSelectedCollaborators: (checked, collaborator) =>
        set((state) => {
            const selectedCollaborators = state.selectedCollaborators.slice()
            if (checked) {
                selectedCollaborators.push(collaborator)
            } else {
                const index = selectedCollaborators.findIndex(
                    (item) => item.sk === collaborator.sk,
                )
                if (index > -1) selectedCollaborators.splice(index, 1)
            }
            return { selectedCollaborators }
        }),
    setSelectAllCollaborators: (collaborators) =>
        set(() => ({ selectedCollaborators: collaborators })),
    addCertificateRows: (rows) =>
        set((state) => ({
            certificateRows: [...state.certificateRows, ...rows],
        })),
    updateCertificateRow: (tempId, update) =>
        set((state) => ({
            certificateRows: state.certificateRows.map((row) =>
                row.tempId === tempId ? { ...row, ...update } : row,
            ),
        })),
    removeCertificateRow: (tempId) =>
        set((state) => {
            const row = state.certificateRows.find((r) => r.tempId === tempId)
            const sig = row?.file
                ? `${row.file.name}__${row.file.size}__${row.file.lastModified}`
                : null
            return {
                certificateRows: state.certificateRows.filter(
                    (r) => r.tempId !== tempId,
                ),
                deletedFileSignatures: sig
                    ? [...state.deletedFileSignatures, sig]
                    : state.deletedFileSignatures,
            }
        }),
    setSelectedCertificate: (certificate) =>
        set(() => ({ selectedCertificate: certificate })),
    fireProcessAll: () => set(() => ({ isProcessingAll: true })),
    setIsProcessingAll: (value) => set(() => ({ isProcessingAll: value })),
    fireSaveAll: () =>
        set((state) => ({ triggerSaveAll: state.triggerSaveAll + 1 })),
}))
