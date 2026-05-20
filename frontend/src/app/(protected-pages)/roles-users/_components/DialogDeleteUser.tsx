'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { Button, Dialog, toast, Notification } from '@/components/ui'
import { deleteUser } from '@/server/actions/users/update'
import { TUser } from '../types'
import { usersKeys } from '@/server/actions/users/users-keys'

type DialogDeleteUserProps = {
    isOpen: boolean
    onClose: () => void
    selectedUser: TUser | null
}

const DialogDeleteUser = ({
    isOpen,
    onClose,
    selectedUser,
}: DialogDeleteUserProps) => {
    const queryClient = useQueryClient()
    const { protectedQueryFn } = useProtectedQueryFn()

    const deleteMutation = useMutation({
        mutationFn: () =>
            protectedQueryFn(() => deleteUser(selectedUser!.sk.split('#')[1])),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: usersKeys.data,
            })
            onClose()
        },
        onError: (error) => {
            toast.push(
                <Notification
                    closable
                    title="Error al borrar el usuario"
                    type="danger"
                >
                    {error instanceof Error
                        ? error.message
                        : 'No fue posible eliminar el usuario.'}
                </Notification>,
            )
        },
    })

    const isDeleting = deleteMutation.isPending

    const handleDelete = async () => {
        if (!selectedUser) {
            toast.push(
                <Notification title="Error al borrar usuario" type="warning">
                    No se encontró el usuario a eliminar.
                </Notification>,
            )
            return
        }

        deleteMutation.mutate()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            shouldCloseOnEsc={!isDeleting}
            shouldCloseOnOverlayClick={!isDeleting}
        >
            <h5 className="mb-4">Eliminar usuario</h5>

            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                    ¿Estás seguro que deseas eliminar este usuario?
                </p>

                {selectedUser && (
                    <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        <span className="font-medium">Usuario:</span>{' '}
                        {selectedUser?.name}
                        <br />
                        <span className="font-medium">Email:</span>{' '}
                        {selectedUser?.email}
                    </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    <b>Esta acción no se puede deshacer.</b> Por seguridad no se
                    eliminarán las notificaciones, ni actividades asociadas al
                    usuario.
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <Button variant="plain" disabled={isDeleting} onClick={onClose}>
                    Cancelar
                </Button>

                <Button
                    variant="solid"
                    color="red-600"
                    loading={isDeleting}
                    disabled={isDeleting || !selectedUser}
                    onClick={handleDelete}
                >
                    Borrar
                </Button>
            </div>
        </Dialog>
    )
}

export default DialogDeleteUser
