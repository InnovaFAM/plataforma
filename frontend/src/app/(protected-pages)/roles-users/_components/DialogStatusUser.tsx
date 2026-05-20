'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { Button, Dialog, toast, Notification } from '@/components/ui'
import { TUser } from '../types'
import { usersKeys } from '@/server/actions/users/users-keys'
import { updateUser } from '@/server/actions/users/update'

type DialogStatusUserProps = {
    isOpen: boolean
    onClose: () => void
    selectedUser: TUser | null
}

const DialogDeleteUser = ({
    isOpen,
    onClose,
    selectedUser,
}: DialogStatusUserProps) => {
    const queryClient = useQueryClient()
    const { protectedQueryFn } = useProtectedQueryFn()

    const statusMutation = useMutation({
        mutationFn: () =>
            protectedQueryFn(() =>
                updateUser(selectedUser!.sk, {
                    status:
                        selectedUser?.status === 'inactivo'
                            ? 'activo'
                            : 'inactivo',
                }),
            ),
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
                    title="Error al cambiar el estado del usuario"
                    type="danger"
                >
                    {error instanceof Error
                        ? error.message
                        : 'No fue posible cambiar el estado del usuario.'}
                </Notification>,
            )
        },
    })

    const isChangingStatus = statusMutation.isPending

    const handleDelete = async () => {
        if (!selectedUser) {
            toast.push(
                <Notification
                    title="Error al cambiar estado del usuario"
                    type="warning"
                >
                    No se encontró el usuario para cambiar su estado.
                </Notification>,
            )
            return
        }

        statusMutation.mutate()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            shouldCloseOnEsc={!isChangingStatus}
            shouldCloseOnOverlayClick={!isChangingStatus}
        >
            <h5 className="mb-4">
                {selectedUser?.status === 'activo'
                    ? 'Desactivar usuario'
                    : 'Activar usuario'}
            </h5>

            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                    ¿Estás seguro que deseas{' '}
                    {selectedUser?.status === 'activo'
                        ? 'desactivar'
                        : 'activar'}{' '}
                    este usuario?
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
                    {selectedUser?.status === 'activo'
                        ? 'El usuario será desactivado y no tendrá acceso a la plataforma.'
                        : 'El usuario será activado y podrá ingresar a la plataforma.'}
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <Button
                    variant="plain"
                    disabled={isChangingStatus}
                    onClick={onClose}
                >
                    Cancelar
                </Button>

                <Button
                    variant="solid"
                    color="red-600"
                    loading={isChangingStatus}
                    disabled={isChangingStatus || !selectedUser}
                    onClick={handleDelete}
                >
                    {selectedUser?.status === 'activo'
                        ? 'Desactivar'
                        : 'Activar'}
                </Button>
            </div>
        </Dialog>
    )
}

export default DialogDeleteUser
