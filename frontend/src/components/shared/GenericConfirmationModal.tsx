import { Button, Dialog } from '../ui'

interface GenericConfirmationModalProps {
    isOpen: boolean
    title: string
    description: string
    confirmButtonText: string
    cancelButtonText: string
    onConfirm: () => void
    onCancel: () => void
}

const GenericConfirmationModal = ({
    isOpen,
    title,
    description,
    confirmButtonText,
    cancelButtonText,
    onConfirm,
    onCancel,
}: GenericConfirmationModalProps) => {
    if (!isOpen) return null

    return (
        <Dialog isOpen={isOpen} onClose={onCancel} onRequestClose={onCancel}>
            <div className="flex flex-col gap-4 p-4">
                <p>{title}</p>
                <p>{description}</p>
                <div className="flex justify-end gap-2">
                    <Button variant="plain" onClick={onCancel}>
                        {cancelButtonText}
                    </Button>
                    <Button variant="solid" onClick={onConfirm}>
                        {confirmButtonText}
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default GenericConfirmationModal
