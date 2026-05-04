import { TCollaboratorCertificate } from '@/app/(protected-pages)/collaborators/types'
import ApiService from './ApiService'
import { getAccessToken } from '@/utils/getAccessToken'
import { TService } from '@/app/(protected-pages)/services/types'

export async function apiCheckCertificateStatus(hash: string) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<{
        found: boolean
        data?: TCollaboratorCertificate
    }>({
        url: `/checks/certificates/${hash}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}

export async function apiCheckServiceStatus(hash: string) {
    const accessToken = await getAccessToken()
    return ApiService.fetchDataWithAxios<{
        found: boolean
        data?: Partial<TService>
    }>({
        url: `/checks/services/${hash}`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'get',
    })
}
