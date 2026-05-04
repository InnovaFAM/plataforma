'use server'

import { signIn } from '@/auth'
import appConfig from '@/configs/app.config'
import { AuthError } from 'next-auth'

export type SignInEmailOtpCredential = {
    email: string
    code: string
    cognitoSession: string
}

export const onSignInWithEmailOtp = async (
    { email, code, cognitoSession }: SignInEmailOtpCredential,
    callbackUrl?: string,
) => {
    try {
        await signIn('credentials', {
            email,
            code,
            cognitoSession,
            redirectTo: callbackUrl || appConfig.authenticatedEntryPath,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Código inválido' }
                default:
                    return { error: 'Something went wrong!' }
            }
        }

        throw error
    }
}
