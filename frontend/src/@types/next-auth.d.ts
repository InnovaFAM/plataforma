import { DefaultSession, DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        accessToken?: string
        user: {
            id: string
            lastLogin?: string
            phoneNumber?: string
            authority?: string[]
        } & DefaultSession['user']
    }

    interface JWT {
        accessToken?: string
        idToken?: string
        refreshToken?: string
        expiresAt?: number
    }

    interface User extends DefaultUser {
        phoneNumber?: string
        lastLogin?: string
        roleSk?: string
        roleName?: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        phoneNumber?: string
        lastLogin?: string
    }
}
