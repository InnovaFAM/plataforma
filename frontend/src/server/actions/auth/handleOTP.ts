'use server'

import getSecretHash from '@/server/utils/getSecretHash'
import {
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION!,
})

export type StartEmailOtpResult =
    | {
          ok: true
          cognitoSession: string
          destination?: string | null
      }
    | {
          ok: false
          error: string
      }

export const onStartSignInWithEmailOtp = async (
    email: string,
): Promise<StartEmailOtpResult> => {
    try {
        if (!email) {
            return { ok: false, error: 'Email is required' }
        }

        const initial = await cognito.send(
            new InitiateAuthCommand({
                ClientId: process.env.COGNITO_CLIENT_ID!,
                AuthFlow: 'USER_AUTH',
                AuthParameters: {
                    USERNAME: email,
                    PREFERRED_CHALLENGE: 'EMAIL_OTP',
                    SECRET_HASH: getSecretHash(email),
                },
            }),
        )

        if (initial.ChallengeName === 'EMAIL_OTP' && initial.Session) {
            return {
                ok: true,
                cognitoSession: initial.Session,
                destination: email,
            }
        }

        if (initial.ChallengeName === 'SELECT_CHALLENGE' && initial.Session) {
            const selected = await cognito.send(
                new RespondToAuthChallengeCommand({
                    ClientId: process.env.COGNITO_CLIENT_ID!,
                    ChallengeName: 'SELECT_CHALLENGE',
                    Session: initial.Session,
                    ChallengeResponses: {
                        USERNAME: email,
                        ANSWER: 'EMAIL_OTP',
                        SECRET_HASH: getSecretHash(email),
                    },
                }),
            )

            if (selected.ChallengeName === 'EMAIL_OTP' && selected.Session) {
                return {
                    ok: true,
                    cognitoSession: selected.Session,
                    destination: email,
                }
            }
        }

        return { ok: false, error: 'No se pudo iniciar el flujo EMAIL_OTP' }
    } catch (error) {
        console.error('onStartSignInWithEmailOtp error', error)
        return { ok: false, error: 'No se pudo enviar el código' }
    }
}
