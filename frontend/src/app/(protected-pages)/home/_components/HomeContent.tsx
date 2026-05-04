import Link from 'next/link'
import Card from '@/components/ui/Card'
import type { IconType } from 'react-icons'
import {
    TbAlertTriangle,
    TbArrowRight,
    TbBell,
    TbCalendarStats,
    TbClipboardList,
    TbClockHour4,
    TbFileCertificate,
    TbLayoutDashboard,
    TbReportAnalytics,
    TbShieldCheck,
    TbUsers,
} from 'react-icons/tb'

type HomeContentProps = {
    userName?: string
}

type QuickAction = {
    title: string
    description: string
    href: string
    icon: IconType
}

type RecentSection = {
    title: string
    description: string
    href: string
    icon: IconType
    meta: string
}

type SystemNotification = {
    title: string
    description: string
    href: string
    icon: IconType
    tone: 'warning' | 'info' | 'success' | 'danger'
    time: string
}

const quickActions: QuickAction[] = [
    {
        title: 'Nuevo servicio',
        description: 'Crear o configurar un nuevo servicio.',
        href: '/services',
        icon: TbClipboardList,
    },
    {
        title: 'Ver colaboradores',
        description: 'Revisar disponibilidad y asignaciones.',
        href: '/collaborators',
        icon: TbUsers,
    },
    {
        title: 'Gestionar turnos',
        description: 'Crear, editar o revisar turnos activos.',
        href: '/shifts',
        icon: TbClockHour4,
    },
    {
        title: 'Reporte HH',
        description: 'Consultar horas hombre y ausencias.',
        href: '/hh-reports',
        icon: TbReportAnalytics,
    },
]

const recentSections: RecentSection[] = [
    {
        title: 'Proyectos',
        description: 'Revisión de servicios y cobertura operacional.',
        href: '/projects',
        icon: TbLayoutDashboard,
        meta: 'Última visita hace 12 min',
    },
    {
        title: 'Matrices de Certificaciones',
        description: 'Validación de requisitos por cargo.',
        href: '/certification-matrix',
        icon: TbShieldCheck,
        meta: 'Última visita hoy',
    },
    {
        title: 'Reportes HH',
        description: 'Control de horas, ausencias y distribución.',
        href: '/hh-reports',
        icon: TbCalendarStats,
        meta: 'Última visita ayer',
    },
]

const notifications: SystemNotification[] = [
    {
        title: 'Roles sin cobertura',
        description:
            'Hay 7 cargos requeridos que aún no tienen colaboradores confirmados.',
        href: '/services',
        icon: TbAlertTriangle,
        tone: 'warning',
        time: 'Hace 8 min',
    },
    {
        title: 'Certificaciones próximas a vencer',
        description:
            '12 colaboradores tienen certificaciones con vencimiento dentro de los próximos 30 días.',
        href: '/certifications',
        icon: TbFileCertificate,
        tone: 'danger',
        time: 'Hace 25 min',
    },
    {
        title: 'Nuevas notificaciones del sistema',
        description:
            'Se recibieron actualizaciones asociadas a proyectos y asignaciones recientes.',
        href: '/notifications',
        icon: TbBell,
        tone: 'info',
        time: 'Hoy',
    },
]

const toneClasses: Record<SystemNotification['tone'], string> = {
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-red-200',
    info: 'bg-blue-50 text-blue-700 ring-blue-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const iconToneClasses: Record<SystemNotification['tone'], string> = {
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-emerald-100 text-emerald-700',
}

export default function HomeContent({
    userName = 'Patricio',
}: HomeContentProps) {
    return (
        <section className="w-full px-6 py-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <span className="mb-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                                Panel principal
                            </span>

                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                                Bienvenido, {userName}!
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                Revisa el estado del sistema, continúa desde tus
                                últimas secciones revisadas y accede rápidamente
                                a las tareas operativas más utilizadas.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-gray-50 p-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    18
                                </p>
                                <p className="text-xs font-medium text-gray-500">
                                    Servicios activos
                                </p>
                            </div>

                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    7
                                </p>
                                <p className="text-xs font-medium text-gray-500">
                                    Roles pendientes
                                </p>
                            </div>

                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    12
                                </p>
                                <p className="text-xs font-medium text-gray-500">
                                    Alertas
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                        <Card className="h-full">
                            <div className="p-5">
                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900">
                                            Últimas secciones revisadas
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Continúa rápidamente desde donde
                                            quedaste.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {recentSections.map((section) => {
                                        const Icon = section.icon

                                        return (
                                            <Link
                                                key={section.title}
                                                href={section.href}
                                                className="group rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
                                            >
                                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                                                    <Icon className="h-5 w-5" />
                                                </div>

                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {section.title}
                                                </h3>

                                                <p className="mt-2 min-h-[40px] text-sm leading-5 text-gray-500">
                                                    {section.description}
                                                </p>

                                                <div className="mt-4 flex items-center justify-between text-xs font-medium text-gray-400">
                                                    <span>{section.meta}</span>
                                                    <TbArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="h-full">
                        <div className="p-5">
                            <div className="mb-5">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Accesos rápidos
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Acciones frecuentes del sistema.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                {quickActions.map((action) => {
                                    const Icon = action.icon

                                    return (
                                        <Link
                                            key={action.title}
                                            href={action.href}
                                            className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:shadow-sm"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {action.title}
                                                </p>
                                                <p className="truncate text-xs text-gray-500">
                                                    {action.description}
                                                </p>
                                            </div>

                                            <TbArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-1" />
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="p-5">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Alertas y notificaciones
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Eventos recientes que requieren revisión o
                                    seguimiento.
                                </p>
                            </div>

                            <Link
                                href="/notifications"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                            >
                                Ver todas
                                <TbArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {notifications.map((notification) => {
                                const Icon = notification.icon

                                return (
                                    <Link
                                        key={notification.title}
                                        href={notification.href}
                                        className="group rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconToneClasses[notification.tone]}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClasses[notification.tone]}`}
                                            >
                                                {notification.time}
                                            </span>
                                        </div>

                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {notification.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-5 text-gray-500">
                                            {notification.description}
                                        </p>

                                        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
                                            Revisar detalle
                                            <TbArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    )
}
