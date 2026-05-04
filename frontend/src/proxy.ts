// src/proxy.ts
import NextAuth from 'next-auth'

import authConfig from '@/configs/auth.config'
import {
    authRoutes as _authRoutes,
    publicRoutes as _publicRoutes,
    // protectedRoutes
} from '@/configs/routes.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import appConfig from '@/configs/app.config'

const { auth } = NextAuth(authConfig)

const publicRoutes = Object.keys(_publicRoutes)
const authRoutes = Object.keys(_authRoutes)

const apiAuthPrefix = `${appConfig.apiPrefix}/auth`

export const proxy = auth((req) => {
    const { nextUrl } = req
    const isSignedIn = !!req.auth

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)

    // Skip auth proxy for api auth routes
    if (isApiAuthRoute) return

    if (isAuthRoute) {
        if (isSignedIn) {
            return Response.redirect(
                new URL(appConfig.authenticatedEntryPath, nextUrl),
            )
        }
        return
    }

    if (!isSignedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
            callbackUrl += nextUrl.search
        }

        return Response.redirect(
            new URL(
                `${appConfig.unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${encodeURIComponent(callbackUrl)}`,
                nextUrl,
            ),
        )
    }

    // if (
    //     isSignedIn &&
    //     nextUrl.pathname !== '/access-denied' &&
    //     !nextUrl.pathname.startsWith(appConfig.apiPrefix)
    // ) {
    //     const routeMeta = protectedRoutes[nextUrl.pathname]
    //     const existingRoute = routeMeta
    //     const includedRole = routeMeta?.authority.some((role) =>
    //         req.auth?.user?.authority.includes(role),
    //     )
    //
    //     if (existingRoute && !includedRole) {
    //         return Response.redirect(new URL('/access-denied', nextUrl))
    //     }
    // }
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}
