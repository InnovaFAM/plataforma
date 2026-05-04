import Credentials from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import {
    CognitoIdentityProviderClient,
    RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import getSecretHash from '@/server/utils/getSecretHash'
import { decodeCognitoAccessToken } from '@/utils/decodeCognitoAccessToken'
import { getByID } from '@/server/actions/users/list-users'
import { updateLastLogin } from '@/server/actions/users/update-user'
import { TUser } from '@/app/(protected-pages)/roles-users/types'

const cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION!,
})

export default {
    providers: [
        Credentials({
            name: 'Email OTP',
            credentials: {
                email: { label: 'Email', type: 'email' },
                code: { label: 'Code', type: 'text' },
                cognitoSession: { label: 'Cognito Session', type: 'text' },
            },
            async authorize(credentials) {
                const email = credentials?.email as string | undefined
                const code = credentials?.code as string | undefined
                const cognitoSession = credentials?.cognitoSession as
                    | string
                    | undefined

                if (!email || !code || !cognitoSession) return null

                const response = await cognito.send(
                    new RespondToAuthChallengeCommand({
                        ClientId: process.env.COGNITO_CLIENT_ID!,
                        ChallengeName: 'EMAIL_OTP',
                        Session: cognitoSession,
                        ChallengeResponses: {
                            USERNAME: email,
                            EMAIL_OTP_CODE: code,
                            SECRET_HASH: getSecretHash(email),
                        },
                    }),
                )

                if (!response.AuthenticationResult) return null

                const accessToken = response.AuthenticationResult.AccessToken

                if (accessToken) {
                    const accessTokenPayload =
                        decodeCognitoAccessToken(accessToken)
                    if (accessTokenPayload) {
                        const responseUser = await getByID(
                            accessTokenPayload.sub,
                        )
                        if (responseUser.success) {
                            const lastLogin = new Date().toISOString()
                            await updateLastLogin(
                                accessTokenPayload.sub,
                                lastLogin,
                            )

                            const user = responseUser.data as TUser
                            return {
                                id: accessTokenPayload.sub,
                                name: user.name,
                                phoneNumber: user.phoneNumber,
                                email,
                                image: user.pictureUrl,
                                lastLogin,
                                roleSk: user.role?.sk,
                                roleName: user.role?.name,
                                accessToken:
                                    response.AuthenticationResult.AccessToken,
                                idToken: response.AuthenticationResult.IdToken,
                                refreshToken:
                                    response.AuthenticationResult.RefreshToken,
                                expiresIn:
                                    response.AuthenticationResult.ExpiresIn,
                            }
                        }
                    }
                }

                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email
                token.id = user.id
                token.phoneNumber = user.phoneNumber
                token.roleSk = user.roleSk
                token.roleName = user.roleName
                token.accessToken = (user as any).accessToken
                token.idToken = (user as any).idToken
                token.refreshToken = (user as any).refreshToken
                token.lastLogin = (user as any).lastLogin

                const expiresInSeconds = (user as any).expiresIn
                if (expiresInSeconds) {
                    token.expiresAt = Date.now() + expiresInSeconds * 1000 // Almacena la fecha en milisegundos
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.roleSk = token.roleSk as string
                session.user.roleName = token.roleName as string
                session.user.phoneNumber = token.phoneNumber as string
                session.user.lastLogin = token.lastLogin as string
            }
            ;(session as any).accessToken = token.accessToken
            ;(session as any).idToken = token.idToken
            ;(session as any).refreshToken = token.refreshToken
            if (token.expiresAt) {
                ;(session as any).expiresAt = token.expiresAt
            }
            return session
        },
    },
    session: {
        strategy: 'jwt' as const,
        maxAge: 60 * 60 * 12,
        updateAge: 60 * 60 * 2,
    },
} satisfies NextAuthConfig
