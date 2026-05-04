import Alert from '@/components/ui/Alert'
import OtpVerificationForm from './OtpVerificationForm'
import sleep from '@/utils/sleep'
import useTheme from '@/utils/hooks/useTheme'
import Logo from '@/components/template/Logo'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import React, { useEffect, useMemo, useState } from 'react'

export type OtpVerificationProps = {
    ok: boolean
    destination: string
    cognitoSession: string
}

const RESEND_COUNTDOWN_SECONDS = 60
const MAX_RESEND_ATTEMPTS = 2

export const OtpVerification: React.FC<OtpVerificationProps> = (
    props: OtpVerificationProps,
) => {
    const mode = useTheme((state) => state.mode)

    const [otpVerified, setOtpVerified] = useTimeOutMessage()
    const [otpResend, setOtpResend] = useTimeOutMessage()
    const [message, setMessage] = useTimeOutMessage()

    const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_SECONDS)
    const [resendAttempts, setResendAttempts] = useState(0)
    const [isResending, setIsResending] = useState(false)

    const hasReachedResendLimit = resendAttempts >= MAX_RESEND_ATTEMPTS

    const canResendOtp = useMemo(() => {
        return countdown === 0 && !isResending && !hasReachedResendLimit
    }, [countdown, isResending, hasReachedResendLimit])

    useEffect(() => {
        if (countdown <= 0 || hasReachedResendLimit) {
            return
        }

        const interval = window.setInterval(() => {
            setCountdown((currentCountdown) => {
                if (currentCountdown <= 1) {
                    return 0
                }

                return currentCountdown - 1
            })
        }, 1000)

        return () => {
            window.clearInterval(interval)
        }
    }, [countdown, hasReachedResendLimit])

    const handleResendOtp = async () => {
        if (!canResendOtp) {
            return
        }

        try {
            setIsResending(true)

            /**
             * TODO: Replace this with your real resend OTP API call.
             * Example:
             * await resendOtp({
             *     destination: props.destination,
             *     cognitoSession: props.cognitoSession,
             * })
             */
            await sleep(500)

            const nextResendAttempts = resendAttempts + 1

            setResendAttempts(nextResendAttempts)
            setOtpResend('Hemos enviado un nuevo código de verificación.')

            if (nextResendAttempts < MAX_RESEND_ATTEMPTS) {
                setCountdown(RESEND_COUNTDOWN_SECONDS)
            } else {
                setCountdown(0)
            }
        } catch (errors) {
            setMessage?.(
                typeof errors === 'string'
                    ? errors
                    : 'No fue posible reenviar el código.',
            )
        } finally {
            setIsResending(false)
        }
    }

    return (
        <>
            <div className="mb-8">
                <Logo
                    className="mb-2"
                    type="full"
                    mode={mode}
                    logoWidth={150}
                    logoHeight={90}
                />
                <h3 className="mb-2">Verificación de Ingreso</h3>
                <p className="font-semibold heading-text">
                    Si el correo <b>{props.destination}</b> existe, recibirá un
                    código para ingresar a la plataforma.
                </p>
            </div>

            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}

            {otpResend && (
                <Alert showIcon className="mb-4" type="info">
                    <span className="break-all">{otpResend}</span>
                </Alert>
            )}

            {otpVerified && (
                <Alert showIcon className="mb-4" type="success">
                    <span className="break-all">{otpVerified}</span>
                </Alert>
            )}

            {hasReachedResendLimit && (
                <Alert showIcon className="mb-4" type="warning">
                    <span>
                        Ha alcanzado el límite de solicitudes de código. Si no
                        puede ingresar, contacte al administrador.
                    </span>
                </Alert>
            )}

            <OtpVerificationForm
                {...props}
                setMessage={setMessage}
                setOtpVerified={setOtpVerified}
            />

            <div className="mt-4 text-center">
                {!hasReachedResendLimit && countdown > 0 && (
                    <p className="font-semibold text-sm">
                        Podrá reenviar el código en{' '}
                        <span className="heading-text font-bold">
                            {countdown}s
                        </span>
                    </p>
                )}

                {!hasReachedResendLimit && countdown === 0 && (
                    <>
                        <span className="font-semibold">
                            ¿No ha recibido el código?{' '}
                        </span>
                        <button
                            type="button"
                            className="heading-text font-bold underline disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={handleResendOtp}
                            disabled={!canResendOtp}
                        >
                            {isResending ? 'Reenviando...' : 'Reenviar Código'}
                        </button>
                    </>
                )}

                {hasReachedResendLimit && (
                    <button
                        type="button"
                        className="heading-text font-bold underline opacity-50 cursor-not-allowed"
                        disabled
                    >
                        Reenvío bloqueado
                    </button>
                )}
            </div>
        </>
    )
}

export default OtpVerification
