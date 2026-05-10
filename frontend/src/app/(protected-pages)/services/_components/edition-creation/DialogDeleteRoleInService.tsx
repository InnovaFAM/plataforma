'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { MouseEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { toast, Notification } from '@/components/ui'
import { deleteRoleInService } from '@/server/actions/services/delete-role-in-service'
import { serviceKeys } from '@/server/actions/services/service-keys'

type DialogDeleteCertificateProps = {
    isOpen: boolean
    serviceId: string
    roleName: string
    roleHash?: string
    onClose: () => void
}

const DialogDeleteRoleInService = ({
    isOpen,
    serviceId,
    roleHash,
    roleName,
    onClose,
}: DialogDeleteCertificateProps) => {
    const queryClient = useQueryClient()
    const { protectedQueryFn } = useProtectedQueryFn()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleClose = (_e?: MouseEvent) => {
        if (isDeleting) return

        onClose()
    }

    const deleteMutation = useMutation({
        mutationFn: async () =>
            protectedQueryFn(() => deleteRoleInService(serviceId, roleHash!)),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: serviceKeys.rolesByServiceId(serviceId),
            })
            toast.push(
                <Notification
                    title={`El role ${roleName} ha sido eliminado del servicio.`}
                    type="success"
                />,
            )
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={`Error al borrar el role. ${error.message}`}
                    type="danger"
                />,
            )
        },
    })

    const handleDelete = async () => {
        if (!roleHash) {
            toast.push(
                <Notification
                    title="Error al borrar el role del servicio"
                    type="warning"
                />,
            )
            return
        }

        setIsDeleting(true)

        deleteMutation.mutate()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose}>
            <h5 className="mb-4">Eliminar role del servicio</h5>

            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                    ¿Estás seguro que deseas eliminar este role del servicio?
                </p>

                {roleName && (
                    <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        <span className="font-medium">Role:</span> {roleName}
                    </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción no se puede deshacer.
                </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <Button
                    variant="plain"
                    disabled={isDeleting}
                    onClick={handleClose}
                >
                    Cancelar
                </Button>

                <Button
                    variant="solid"
                    color="red-600"
                    loading={isDeleting}
                    disabled={isDeleting || !roleHash}
                    onClick={handleDelete}
                >
                    Borrar
                </Button>
            </div>
        </Dialog>
    )
}

export default DialogDeleteRoleInService
