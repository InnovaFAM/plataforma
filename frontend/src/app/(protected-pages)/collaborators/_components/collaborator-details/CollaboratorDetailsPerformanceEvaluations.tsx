'use client'

import { useMemo, useState } from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import {
    Button,
    Dialog,
    Select,
    Tooltip,
    Notification,
    toast,
} from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { TbPlus } from 'react-icons/tb'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TCollaboratorEntity } from '../../types'
import { TCollabEvaluation, TCollabEvaluationPayload } from '../../types'
import PerformanceEvaluationsTable from './CollaboratorsDetailsPerformanceEvaluationsTable'
import EvaluationForm from './CollaboratorsDetailsPerformanceEvaluationsForm'
import { deletePerformanceEvaluation } from '@/server/actions/collaborators/delete-performance-evaluation'
import { collaboratorKeys } from '@/server/actions/collaborators/collaborator-keys'
import { addPerformanceEvaluationToCollab } from '@/server/actions/collaborators/add-performance-evaluation'
import dayjs from 'dayjs'

interface CollaboratorDetailsPerformanceEvaluationsProps {
    collaborator: TCollaboratorEntity
    evaluations: TCollabEvaluation[]
}

export type Section = {
    title: string
    items: { key: string; label: string }[]
}

export function averageScore(
    categories: TCollabEvaluation['categories'],
): string {
    const values = categories
        .flatMap((d) => d.criteria.map((c) => Number(c.result)))
        .filter((v) => v > 0)
    if (!values.length) return '-'
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
}

export function allScoresFilled(
    categories: TCollabEvaluation['categories'],
): boolean {
    return categories.every((d) =>
        d.criteria.every((c) => Number(c.result) > 0),
    )
}

export function truncateText(text: string, max = 110): string {
    const normalized = text.trim().replace(/\s+/g, ' ')
    if (normalized.length <= max) return normalized
    return normalized.slice(0, max).trim() + '...'
}

const EVALUATION_TYPE_OPTIONS = [
    { value: 'General', label: 'General' },
    { value: 'Por Servicio', label: 'Por Servicio' },
]

const MOCK_SERVICES: TCollabEvaluation['service'][] = [
    {
        sk: 'service#1',
        serviceName: 'Servicio de ejemplo 1',
    },
    {
        sk: 'service#2',
        serviceName: 'Servicio de ejemplo 2',
    },
]

const CollaboratorDetailsPerformanceEvaluations = ({
    collaborator,
    evaluations,
}: CollaboratorDetailsPerformanceEvaluationsProps) => {
    const t = useTranslation()
    const currentSession = useCurrentSession()
    const queryClient = useQueryClient()
    const collabId = useMemo(
        () => collaborator?.sk?.split('#')?.[1],
        [collaborator],
    )

    const SECTIONS: Section[] = [
        {
            title: t(
                'collaborators.details.performanceEvaluationsForm.sections.technicalSkills',
            ),
            items: [
                {
                    key: 'calidad_ejecucion',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.technicalSkills.quality',
                    ),
                },
                {
                    key: 'uso_herramientas',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.technicalSkills.toolUsage',
                    ),
                },
                {
                    key: 'proactividad_tecnica',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.technicalSkills.technicalProactivity',
                    ),
                },
            ],
        },
        {
            title: t(
                'collaborators.details.performanceEvaluationsForm.sections.availabilityAndEfficiency',
            ),
            items: [
                {
                    key: 'productividad',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.availabilityAndEfficiency.productivity',
                    ),
                },
                {
                    key: 'disposicion',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.availabilityAndEfficiency.disposition',
                    ),
                },
                {
                    key: 'confiabilidad',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.availabilityAndEfficiency.reliability',
                    ),
                },
            ],
        },
        {
            title: t(
                'collaborators.details.performanceEvaluationsForm.sections.behavior',
            ),
            items: [
                {
                    key: 'trabajo_equipo',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.behavior.teamwork',
                    ),
                },
                {
                    key: 'cumplimiento_seguridad',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.behavior.safetyCompliance',
                    ),
                },
                {
                    key: 'disposicion_cambio',
                    label: t(
                        'collaborators.details.performanceEvaluationsForm.criterias.behavior.changeDisposition',
                    ),
                },
            ],
        },
    ]

    const buildInitialDetail = (): TCollabEvaluation['categories'] =>
        SECTIONS.map((section, sIdx) => ({
            name: section.title,
            order: sIdx + 1,
            result: '',
            criteria: section.items.map((item, iIdx) => ({
                name: item.label,
                order: iIdx + 1,
                result: 0,
                note: '',
            })),
        }))

    const [modalOpen, setModalOpen] = useState(false)
    const [draftDetail, setDraftDetail] =
        useState<TCollabEvaluation['categories']>(buildInitialDetail)
    const [draftType, setDraftType] = useState<'General' | 'Por Servicio'>(
        'General',
    )
    const [draftService, setDraftService] =
        useState<TCollabEvaluation['service']>(null)

    const canSave =
        allScoresFilled(draftDetail) &&
        (draftType === 'General' ||
            (draftType === 'Por Servicio' && draftService))

    const addMutation = useMutation({
        mutationFn: async (payload: TCollabEvaluationPayload) => {
            const response = await addPerformanceEvaluationToCollab(
                collabId,
                payload,
            )
            if (!response.success) throw new Error(response.error)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: collaboratorKeys.singleCollaborator(collabId),
            })
            toast.push(
                <Notification
                    title={t(
                        'collaborators.details.performanceEvaluationsForm.messages.saveSuccess',
                    )}
                    type="success"
                />,
            )
            setModalOpen(false)
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={
                        error.message ||
                        t(
                            'collaborators.details.performanceEvaluationsForm.errors.saveError',
                        )
                    }
                    type="danger"
                />,
            )
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (evaluationSk: string) => {
            const response = await deletePerformanceEvaluation(
                collabId,
                evaluationSk.split('#')?.[1],
            )
            if (!response.success) throw new Error(response.error)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: collaboratorKeys.singleCollaborator(collabId),
            })
            toast.push(
                <Notification
                    title={t(
                        'collaborators.details.performanceEvaluationsForm.messages.deleteSuccess',
                    )}
                    type="success"
                />,
            )
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={
                        error.message ||
                        t(
                            'collaborators.details.performanceEvaluationsForm.errors.deleteError',
                        )
                    }
                    type="danger"
                />,
            )
        },
    })

    const handleOpenModal = () => {
        setDraftDetail(buildInitialDetail())
        setDraftType('General')
        setDraftService(null)
        setModalOpen(true)
    }

    const handleDetailChange = (
        sectionIndex: number,
        criteriaIndex: number,
        field: 'result' | 'note',
        value: number | string,
    ) => {
        setDraftDetail((prev) =>
            prev.map((section, sIndex) => {
                if (sIndex !== sectionIndex) return section
                return {
                    ...section,
                    criteria: section.criteria.map((criterion, cIndex) => {
                        if (cIndex !== criteriaIndex) return criterion
                        return { ...criterion, [field]: value }
                    }),
                }
            }),
        )
    }

    const handleSave = () => {
        const avg = averageScore(draftDetail)
        const categoriesWithResults: TCollabEvaluation['categories'] =
            draftDetail.map((section) => {
                const sectionValues = section.criteria
                    .map((c) => Number(c.result))
                    .filter((v) => v > 0)
                const sectionAvg =
                    sectionValues.length > 0
                        ? (
                              sectionValues.reduce((a, b) => a + b, 0) /
                              sectionValues.length
                          ).toFixed(1)
                        : ''
                return { ...section, result: sectionAvg }
            })

        const payload: TCollabEvaluationPayload = {
            createdBy: currentSession?.session?.user?.name || 'Usuario actual',
            createdAt: dayjs().format('DD/MM/YYYY'),
            type: draftType,
            result: avg,
            service: draftType === 'Por Servicio' ? draftService : null,
            categories: categoriesWithResults,
        }

        addMutation.mutate(payload)
    }

    const handleDiscard = () => setModalOpen(false)

    return (
        <AdaptiveCard
            footer={{
                className:
                    'bg-gray-50 dark:bg-gray-700 pb-2 pt-2 rounded-b-2xl flex justify-end',
                content: (
                    <Tooltip title={t('common.add')}>
                        <Button
                            variant="plain"
                            shape="circle"
                            size="xs"
                            icon={<TbPlus />}
                            onClick={handleOpenModal}
                        />
                    </Tooltip>
                ),
            }}
        >
            <h4 className="text-xl font-extrabold text-black dark:text-white mb-4">
                {t('collaborators.details.performanceEvaluations')}
            </h4>

            <PerformanceEvaluationsTable
                evaluations={evaluations}
                onDelete={(sk) => deleteMutation.mutate(sk)}
                isDeleting={deleteMutation.isPending}
            />

            <Dialog
                className="min-w-[80vw]"
                contentClassName="h-[85vh] flex flex-col"
                isOpen={modalOpen}
                onClose={handleDiscard}
                onRequestClose={handleDiscard}
                shouldCloseOnEsc={!addMutation.isPending}
                shouldCloseOnOverlayClick={!addMutation.isPending}
            >
                <div className="flex flex-col h-full gap-6">
                    <div>
                        <h4 className="text-xl font-extrabold text-black dark:text-white">
                            {t(
                                'collaborators.details.addPerformanceEvaluation',
                            )}
                        </h4>
                        <p className="text-gray-500 text-sm mt-1">
                            {t(
                                'collaborators.details.addPerformanceEvaluationSubtitle',
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-52">
                            <Select
                                options={EVALUATION_TYPE_OPTIONS}
                                value={EVALUATION_TYPE_OPTIONS.find(
                                    (o) => o.value === draftType,
                                )}
                                onChange={(option) => {
                                    if (!option) return
                                    setDraftType(
                                        option.value as
                                            | 'General'
                                            | 'Por Servicio',
                                    )
                                    setDraftService(null)
                                }}
                                isDisabled={addMutation.isPending}
                                placeholder={t(
                                    'collaborators.details.performanceEvaluationsForm.selectType',
                                )}
                            />
                        </div>

                        {draftType === 'Por Servicio' && (
                            <div className="w-64">
                                <Select
                                    options={MOCK_SERVICES.map((s) => ({
                                        value: s?.sk || '',
                                        label: s?.serviceName || '',
                                    }))}
                                    value={
                                        draftService
                                            ? {
                                                  value: draftService.sk,
                                                  label: draftService.serviceName,
                                              }
                                            : null
                                    }
                                    onChange={(option) => {
                                        if (!option) {
                                            setDraftService(null)
                                            return
                                        }
                                        setDraftService({
                                            sk: option.value,
                                            serviceName: option.label,
                                        })
                                    }}
                                    isDisabled={addMutation.isPending}
                                    placeholder={t(
                                        'collaborators.details.performanceEvaluationsForm.selectService',
                                    )}
                                    noOptionsMessage={() =>
                                        t(
                                            'collaborators.details.performanceEvaluationsForm.noServices',
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto">
                        <EvaluationForm
                            detail={draftDetail}
                            onDetailChange={handleDetailChange}
                        />
                    </div>

                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 shrink-0">
                        <Button
                            variant="default"
                            onClick={handleDiscard}
                            disabled={addMutation.isPending}
                        >
                            {t('common.discard')}
                        </Button>
                        <Button
                            variant="solid"
                            disabled={!canSave || addMutation.isPending}
                            loading={addMutation.isPending}
                            onClick={handleSave}
                        >
                            {t('common.save')}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </AdaptiveCard>
    )
}

export default CollaboratorDetailsPerformanceEvaluations
