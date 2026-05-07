import Logo from '@/components/template/Logo'
import useTheme from '@/utils/hooks/useTheme'

type GeneralPageLoaderProps = {
    title?: string
    subtitle?: string
    fullScreen?: boolean
    className?: string
}

const GeneralPageLoader = ({
    title = 'Preparando tu espacio de trabajo...',
    subtitle = 'Cargando servicios, colaboradores y permisos',
    fullScreen = true,
    className = '',
}: GeneralPageLoaderProps) => {
    const mode = useTheme((state) => state.mode)
    return (
        <div
            role="status"
            aria-live="polite"
            className={[
                'relative flex items-center justify-center overflow-hidden bg-slate-50',
                fullScreen
                    ? 'min-h-screen w-full'
                    : 'h-full min-h-[420px] w-full rounded-2xl',
                className,
            ].join(' ')}
        >
            <BackgroundPattern />

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
                <div className="mb-10 animate-loader-fade-in">
                    <Logo
                        type="full"
                        mode={mode}
                        logoWidth={150}
                        logoHeight={90}
                    />
                </div>

                <div className="space-y-3">
                    <h1 className="animate-loader-slide-up text-2xl font-semibold tracking-tight text-slate-800 sm:text-3xl">
                        {title}
                    </h1>

                    <p className="animate-loader-slide-up-delayed text-base text-slate-500 sm:text-lg">
                        {subtitle}
                    </p>
                </div>

                <div className="mt-10 flex items-center justify-center gap-3">
                    <span className="h-3 w-3 animate-loader-dot rounded-full bg-sky-500 [animation-delay:0ms]" />
                    <span className="h-3 w-3 animate-loader-dot rounded-full bg-sky-500 [animation-delay:160ms]" />
                    <span className="h-3 w-3 animate-loader-dot rounded-full bg-sky-500 [animation-delay:320ms]" />
                    <span className="h-3 w-3 animate-loader-dot rounded-full bg-sky-500 [animation-delay:480ms]" />
                    <span className="h-3 w-3 animate-loader-dot rounded-full bg-sky-300 [animation-delay:640ms]" />
                </div>
            </div>

            <style>{`
                @keyframes loaderFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes loaderSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes loaderDot {
                    0%, 80%, 100% {
                        opacity: 0.35;
                        transform: translateY(0) scale(0.9);
                    }
                    40% {
                        opacity: 1;
                        transform: translateY(-5px) scale(1);
                    }
                }

                .animate-loader-fade-in {
                    animation: loaderFadeIn 500ms ease-out both;
                }

                .animate-loader-slide-up {
                    animation: loaderSlideUp 550ms ease-out both;
                    animation-delay: 120ms;
                }

                .animate-loader-slide-up-delayed {
                    animation: loaderSlideUp 550ms ease-out both;
                    animation-delay: 220ms;
                }

                .animate-loader-dot {
                    animation: loaderDot 1.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}

const BackgroundPattern = () => {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95),rgba(241,245,249,0.88))]" />

            <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-sky-100/50 blur-3xl" />
            <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-sky-100/60 blur-3xl" />

            <div className="absolute left-0 top-0 h-72 w-72 opacity-60">
                <NetworkShape />
            </div>

            <div className="absolute bottom-0 right-0 h-96 w-96 rotate-180 opacity-70">
                <NetworkShape />
            </div>

            <div className="absolute left-8 bottom-8 h-40 w-64 opacity-30">
                <DotGrid />
            </div>

            <div className="absolute right-14 top-16 h-40 w-64 opacity-25">
                <DotGrid />
            </div>

            <div className="absolute -bottom-16 -left-10 h-48 w-[520px] rounded-[50%] border border-slate-200/70" />
            <div className="absolute -bottom-20 -left-16 h-56 w-[620px] rounded-[50%] border border-slate-200/60" />
            <div className="absolute -top-20 -right-16 h-56 w-[620px] rounded-[50%] border border-slate-200/60" />
        </div>
    )
}

const NetworkShape = () => {
    return (
        <svg
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
        >
            <path
                d="M24 120L82 76L142 106L218 42"
                stroke="#BAE6FD"
                strokeWidth="1"
            />
            <path
                d="M82 76L96 168L176 204L250 142"
                stroke="#BAE6FD"
                strokeWidth="1"
            />
            <path
                d="M142 106L176 204L218 42"
                stroke="#BAE6FD"
                strokeWidth="1"
            />
            <path d="M96 168L32 230L176 204" stroke="#E0F2FE" strokeWidth="1" />

            <circle cx="24" cy="120" r="6" fill="#7DD3FC" />
            <circle cx="82" cy="76" r="10" fill="#BAE6FD" />
            <circle cx="142" cy="106" r="8" fill="#BAE6FD" />
            <circle cx="218" cy="42" r="6" fill="#E0F2FE" />
            <circle cx="96" cy="168" r="7" fill="#BAE6FD" />
            <circle cx="176" cy="204" r="8" fill="#E0F2FE" />
            <circle cx="250" cy="142" r="5" fill="#38BDF8" />
            <circle cx="32" cy="230" r="7" fill="#F0F9FF" />
        </svg>
    )
}

const DotGrid = () => {
    return (
        <div className="grid grid-cols-10 gap-3">
            {Array.from({ length: 50 }).map((_, index) => (
                <span
                    key={index}
                    className="h-1.5 w-1.5 rounded-[2px] bg-slate-300"
                />
            ))}
        </div>
    )
}

export default GeneralPageLoader
