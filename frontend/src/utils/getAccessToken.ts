import { auth } from '@/auth'

export const getAccessToken = async () => {
    const session = await auth()
    const accessToken = (session as any)?.accessToken
    return accessToken
}
