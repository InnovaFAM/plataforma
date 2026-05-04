import { useState } from 'react'
import Table from '@/components/ui/Table'
import { Button, Input } from '@/components/ui'
import { truncateText } from './CollaboratorDetailsPerformanceEvaluations'
import { useTranslations } from 'next-intl'
import { TCollabEvaluation } from '../../types'

const { Tr, Th, Td, THead, TBody } = Table

export interface EvaluationFormProps {
    detail: TCollabEvaluation['categories']
    onDetailChange?: (
        sectionIdx: number,
        criteriaIdx: number,
        field: 'result' | 'note',
        value: number | string,
    ) => void
    disabled?: boolean
}

const EvaluationForm = ({
    detail,
    onDetailChange,
    disabled = false,
}: EvaluationFormProps) => {
    const t = useTranslations()
    const [openNoteKey, setOpenNoteKey] = useState<string | null>(null)

    const toggleNote = (key: string) =>
        setOpenNoteKey((prev) => (prev === key ? null : key))

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <div
                className={disabled ? undefined : 'max-h-[50vh] overflow-auto'}
            >
                <Table cellBorder>
                    <THead>
                        <Tr>
                            <Th className="w-44">
                                {t(
                                    'collaborators.details.performanceEvaluationsForm.columns.category',
                                )}
                            </Th>
                            <Th>
                                {t(
                                    'collaborators.details.performanceEvaluationsForm.columns.criteria',
                                )}
                            </Th>
                            {[1, 2, 3, 4, 5].map((v) => (
                                <Th key={v} className="w-14 text-center">
                                    {v}
                                </Th>
                            ))}
                        </Tr>
                    </THead>

                    <TBody>
                        {detail.map((section, sectionIdx) =>
                            section.criteria.map((criterion, criteriaIdx) => {
                                const noteKey = `${sectionIdx}-${criteriaIdx}`
                                const note = criterion.note ?? ''
                                const hasNote = note.trim().length > 0
                                const isOpen = openNoteKey === noteKey

                                return (
                                    <Tr key={noteKey} className="align-top">
                                        {criteriaIdx === 0 && (
                                            <Td
                                                rowSpan={
                                                    section.criteria.length
                                                }
                                                className="font-semibold align-middle"
                                            >
                                                {section.name}
                                            </Td>
                                        )}

                                        <Td>
                                            <div className="space-y-1.5">
                                                <div className="font-medium text-gray-800 dark:text-gray-100">
                                                    {criterion.name}
                                                </div>

                                                {!disabled && (
                                                    <Button
                                                        variant="plain"
                                                        size="xs"
                                                        onClick={() =>
                                                            toggleNote(noteKey)
                                                        }
                                                        className="text-xs font-semibold text-black hover:text-black/70 underline"
                                                    >
                                                        {isOpen
                                                            ? t(
                                                                  'collaborators.details.performanceEvaluationsForm.closeNote',
                                                              )
                                                            : hasNote
                                                              ? t(
                                                                    'collaborators.details.performanceEvaluationsForm.editNote',
                                                                )
                                                              : t(
                                                                    'collaborators.details.performanceEvaluationsForm.addNote',
                                                                )}
                                                    </Button>
                                                )}

                                                {!isOpen && hasNote && (
                                                    <p className="text-xs text-gray-500 leading-5">
                                                        {truncateText(note)}
                                                    </p>
                                                )}

                                                {isOpen && (
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-700 p-3">
                                                        <Input
                                                            textArea
                                                            rows={3}
                                                            value={note}
                                                            disabled={disabled}
                                                            onChange={(e) =>
                                                                onDetailChange?.(
                                                                    sectionIdx,
                                                                    criteriaIdx,
                                                                    'note',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={t(
                                                                'collaborators.details.performanceEvaluationsForm.evaluationPlaceholder',
                                                            )}
                                                            className="resize-none w-full"
                                                        />
                                                        {!disabled && (
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-[11px] text-gray-400">
                                                                    {
                                                                        note.trim()
                                                                            .length
                                                                    }{' '}
                                                                    {t(
                                                                        'collaborators.details.performanceEvaluationsForm.characters',
                                                                    )}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    {hasNote && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                onDetailChange?.(
                                                                                    sectionIdx,
                                                                                    criteriaIdx,
                                                                                    'note',
                                                                                    '',
                                                                                )
                                                                            }
                                                                            className="text-xs font-medium text-red-500 hover:text-red-600"
                                                                        >
                                                                            {t(
                                                                                'collaborators.details.performanceEvaluationsForm.delete',
                                                                            )}
                                                                        </button>
                                                                    )}
                                                                    <Button
                                                                        size="xs"
                                                                        variant="default"
                                                                        onClick={() =>
                                                                            setOpenNoteKey(
                                                                                null,
                                                                            )
                                                                        }
                                                                    >
                                                                        {t(
                                                                            'collaborators.details.performanceEvaluationsForm.done',
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Td>

                                        {[1, 2, 3, 4, 5].map((value) => {
                                            const isChecked =
                                                criterion.result === value
                                            return (
                                                <Td
                                                    key={value}
                                                    className="text-center"
                                                >
                                                    <label
                                                        className={`inline-flex items-center justify-center ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                                                    >
                                                        <Input
                                                            type="radio"
                                                            name={`${noteKey}_${disabled ? 'view' : 'edit'}`}
                                                            value={value}
                                                            checked={isChecked}
                                                            disabled={disabled}
                                                            onChange={() =>
                                                                onDetailChange?.(
                                                                    sectionIdx,
                                                                    criteriaIdx,
                                                                    'result',
                                                                    value,
                                                                )
                                                            }
                                                            className="peer sr-only"
                                                        />
                                                        <span
                                                            className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition
                                                                ${isChecked ? 'border-primary bg-primary text-white' : 'border-gray-300 text-gray-600'}
                                                                ${!disabled && !isChecked ? 'hover:border-primary/50' : ''}
                                                                ${disabled ? 'opacity-80' : ''}
                                                            `}
                                                        >
                                                            {value}
                                                        </span>
                                                    </label>
                                                </Td>
                                            )
                                        })}
                                    </Tr>
                                )
                            }),
                        )}
                    </TBody>
                </Table>
            </div>
        </div>
    )
}

export default EvaluationForm
