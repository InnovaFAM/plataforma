'use client'

import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTheme from '@/utils/hooks/useTheme'
import type { OnSignIn } from './SignInForm'
import type { OnOauthSignIn } from './OauthSignIn'
import useTranslation from '@/utils/hooks/useTranslation'
import { LoginSessionToast } from '@/app/(auth-pages)/sign-in/_components/LoginSessionToast'

type SignInProps = {
    signUpUrl?: string
    forgetPasswordUrl?: string
    onSignIn?: OnSignIn
    onOauthSignIn?: OnOauthSignIn
}

const SignIn = ({ onSignIn }: SignInProps) => {
    const t = useTranslation()
    const [message, setMessage] = useTimeOutMessage()
    const mode = useTheme((state) => state.mode)

    const errorMessageMapper: Record<string, string> = {
        CredentialsSignin: t('auth.errors.invalidCredentials'),
        OAuthSignin: t('auth.errors.oauthSignInError'),
        default: t('auth.errors.signInError'),
    }

    return (
        <>
            <LoginSessionToast />
            <div className="mb-8">
                <Logo type="full" mode={mode} logoWidth={150} logoHeight={90} />
            </div>
            <div className="mb-10">
                <h2 className="mb-2">{t('auth.welcome')}</h2>
                <p className="font-semibold heading-text">
                    {t('auth.typeCredentials')}
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="">
                        {errorMessageMapper[message] ||
                            errorMessageMapper['default']}
                    </span>
                </Alert>
            )}
            <SignInForm setMessage={setMessage} onSignIn={onSignIn} />
        </>
    )
}

export default SignIn
