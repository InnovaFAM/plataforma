'use client'

import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { useMutation } from '@tanstack/react-query'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { toast, Notification, Alert } from '@/components/ui'
import { getItemType } from '../_utils/getItemType'
import { deleteItem } from '@/server/actions/backoffice/delete-item'
import { TBackOfficeDialogDelete } from '../types'

type DialogDeleteItemProps = {
    isOpen: boolean
    data: TBackOfficeDialogDelete | null
    onClose: () => void
    onDeleted: () => void
}

const DialogDeleteBackOfficeItem = ({
    isOpen,
    data,
    onClose,
    onDeleted,
}: DialogDeleteItemProps) => {
    const { protectedQueryFn } = useProtectedQueryFn()

    const handleClose = () => {
        if (deleteMutation.isPending) return

        onClose()
    }

    const deleteMutation = useMutation({
        mutationFn: async () => protectedQueryFn(() => deleteItem(data!)),
        onSuccess: async () => {
            toast.push(
                <Notification
                    title={`El role ${data?.itemName} ha sido eliminado del servicio.`}
                    type="success"
                />,
            )
            onDeleted()
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={`Error al borrar el item. ${error.message}`}
                    type="danger"
                />,
            )
        },
    })

    const handleDelete = async () => {
        if (!data?.itemHash) {
            toast.push(
                <Notification
                    title="Error al borrar el item. Elemento no definido correctamente."
                    type="warning"
                />,
            )
            return
        }

        deleteMutation.mutate()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={handleClose}
            shouldCloseOnEsc={!deleteMutation.isPending}
            shouldCloseOnOverlayClick={!deleteMutation.isPending}
        >
            <h5 className="mb-4">Eliminar item backoffice</h5>

            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                    ¿Estás seguro que deseas eliminar este item?
                </p>

                {data && (
                    <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        <span className="font-bold">Tipo:</span>{' '}
                        <span className="capitalize">
                            {getItemType(data.itemType.toLowerCase())}
                        </span>
                        <br />
                        <span className="font-bold ">Nombre:</span>{' '}
                        {data.itemName}
                    </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción no se puede deshacer.
                </p>
            </div>
            {deleteMutation.isError && (
                <Alert showIcon className="my-4" type="danger">
                    Error al borrar el item. {deleteMutation.error?.message}
                </Alert>
            )}

            <div className="mt-6 flex justify-end gap-2">
                <Button
                    variant="plain"
                    disabled={deleteMutation.isPending}
                    onClick={handleClose}
                >
                    Cancelar
                </Button>

                <Button
                    variant="solid"
                    color="red-600"
                    loading={deleteMutation.isPending}
                    disabled={deleteMutation.isPending || !data}
                    onClick={handleDelete}
                >
                    {deleteMutation.isPending ? 'Borrando...' : 'Borrar'}
                </Button>
            </div>
        </Dialog>
    )
}

export default DialogDeleteBackOfficeItem
