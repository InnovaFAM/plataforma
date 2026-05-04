import { TbTrash, TbPencil } from 'react-icons/tb'

interface BackOfficeActionColumnProps {
    onEdit: () => void
    onDelete: () => void
}

const BackOfficeActionColumn = ({
    onEdit,
    onDelete,
}: BackOfficeActionColumnProps) => {
    return (
        <div className="flex items-center justify-start gap-3">
            <div
                className={`text-xl cursor-pointer select-none font-semibold`}
                role="button"
                onClick={() => {
                    onDelete()
                }}
            >
                <TbTrash />
            </div>
            <div
                className={`text-xl cursor-pointer select-none font-semibold`}
                role="button"
                onClick={() => {
                    onEdit()
                }}
            >
                <TbPencil />
            </div>
        </div>
    )
}

export default BackOfficeActionColumn
