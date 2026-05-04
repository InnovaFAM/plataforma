'use client'

import { useState, useMemo } from 'react'
import GanttChart, { ViewMode } from '@/components/shared/GanttChart'
import type { ExtendedTask } from '@/components/shared/GanttChart'
import { FaExpand } from 'react-icons/fa6'
import getServiceProgression from '../_utils/getServiceProgression'
import { Dialog } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { TServiceRole } from '../types'

const colorsMap = {
    confirmed: '#10b981',
    preConfirmed: '#ff6a55',
    proposal: '#f59e0b',
    role: '#2a85ff',
}

const AssignedRolesCalendar = ({ data }: { data: TServiceRole[] }) => {
    const t = useTranslation()
    const [view, setView] = useState<'regular' | 'full-screen'>('regular')

    const initialTasks = useMemo(() => {
        const flatTasks: ExtendedTask[] = []
        data.forEach((role, roleIndex) => {
            const roleId = `role-${roleIndex}`
            flatTasks.push({
                id: roleId,
                name: role.roleName,
                start: new Date(role.startedAt || Date.now()),
                end: new Date(role.endedAt || Date.now()),
                type: 'project',
                progress: getServiceProgression(role.startedAt, role.endedAt),
                hideChildren: false,
                displayOrder: flatTasks.length + 1,
                barVariant: 'role',
            })
            /*role.assignments?.forEach((assign, assignIndex) => {
                flatTasks.push({
                    id: `${roleId}-assign-${assignIndex}`,
                    name: assign.name,
                    start: new Date(assign.startedAt || Date.now()),
                    end: new Date(assign.endedAt || Date.now()),
                    project: roleId,
                    type: 'task',
                    progress: getServiceProgression(
                        assign.startedAt,
                        assign.endedAt,
                    ),
                    displayOrder: flatTasks.length + 1,
                    barVariant: assign.status,
                })
                })*/
        })
        return flatTasks
    }, [data])

    const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks)

    const renderCalendar = (maxHeight: string = '500px') => {
        return (
            <div className="w-full overflow-auto" style={{ maxHeight }}>
                <div style={{ minWidth: '100%' }}>
                    {tasks.length > 0 ? (
                        <GanttChart
                            columnName={t('services.common.roles')}
                            viewMode={ViewMode.Month}
                            tasks={tasks}
                            colorsMap={colorsMap}
                            onExpanderClick={(task) =>
                                setTasks(
                                    tasks.map((t) =>
                                        t.id === task.id ? task : t,
                                    ),
                                )
                            }
                            listCellWidth="160px"
                            columnWidth={100}
                        />
                    ) : (
                        <div className="p-10 text-center">
                            {t('common.noDataAvailable')}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 w-full min-w-0">
            <div className="flex justify-end mb-2">
                <FaExpand
                    size={16}
                    onClick={() =>
                        setView(view === 'regular' ? 'full-screen' : 'regular')
                    }
                    className="hover:cursor-pointer hover:scale-110 transition-transform"
                />
            </div>
            {view === 'regular' ? (
                renderCalendar('500px')
            ) : (
                <Dialog
                    shouldCloseOnEsc={true}
                    shouldCloseOnOverlayClick={true}
                    shouldReturnFocusAfterClose
                    isOpen={view === 'full-screen'}
                    onClose={() => setView('regular')}
                    onRequestClose={() => setView('regular')}
                    className="min-w-[90vw] max-h-[85vh] overflow-hidden flex flex-col p-6"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">
                            {t('services.common.roles')}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {renderCalendar('70vh')}
                    </div>
                </Dialog>
            )}
        </div>
    )
}

export default AssignedRolesCalendar
