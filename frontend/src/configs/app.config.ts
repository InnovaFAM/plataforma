export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    locale: string
    activeNavTranslation: boolean
}
const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000'

const appConfig: AppConfig = {
    apiPrefix: baseUrl,
    authenticatedEntryPath: '/home',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'es',
    activeNavTranslation: false,
}

export default appConfig
