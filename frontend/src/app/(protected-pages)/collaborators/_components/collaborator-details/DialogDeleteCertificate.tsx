'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import type { MouseEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { deleteCertificate } from '@/server/actions/collaborators/save-collaborator-certificate'
import { toast, Notification } from '@/components/ui'
import { collaboratorKeys } from '@/server/actions/collaborators/collaborator-keys'

type DialogDeleteCertificateProps = {
    isOpen: boolean
    collaboratorId: string
    certificateSk?: string
    certificateName?: string
    onClose: () => void
    onDeleted?: (sk: string) => void
}

const DialogDeleteCertificate = ({
    isOpen,
    collaboratorId,
    certificateSk,
    certificateName,
    onClose,
    onDeleted,
}: DialogDeleteCertificateProps) => {
    const queryClient = useQueryClient()
    const { protectedQueryFn } = useProtectedQueryFn()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleClose = (_e?: MouseEvent) => {
        if (isDeleting) return

        onClose()
    }

    const deleteMutation = useMutation({
        mutationFn: () =>
            protectedQueryFn(() =>
                deleteCertificate(
                    collaboratorId,
                    certificateSk?.split('#')[1] || '',
                ),
            ),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: collaboratorKeys.singleCollaborator(collaboratorId),
            })
            onDeleted?.(certificateSk!)
            onClose()
        },
        onError: (error) => {
            toast.push(
                <Notification
                    closable
                    title="Error al borrar certificado"
                    type="danger"
                >
                    {error instanceof Error
                        ? error.message
                        : 'No fue posible eliminar el certificado.'}
                </Notification>,
            )

            setIsDeleting(false)
        },
    })

    const handleDelete = async () => {
        if (!certificateSk) {
            toast.push(
                <Notification
                    title="Error al borrar certificado"
                    type="warning"
                >
                    No se encontró el certificado a eliminar.
                </Notification>,
            )
            return
        }

        setIsDeleting(true)

        deleteMutation.mutate()
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose}>
            <h5 className="mb-4">Eliminar certificado</h5>

            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                    ¿Estás seguro que deseas eliminar este certificado?
                </p>

                {certificateName && (
                    <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        <span className="font-medium">Certificado:</span>{' '}
                        {certificateName}
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
                    disabled={isDeleting || !certificateSk}
                    onClick={handleDelete}
                >
                    Borrar
                </Button>
            </div>
        </Dialog>
    )
}

export default DialogDeleteCertificate
