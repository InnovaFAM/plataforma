import { TService } from '../services/types'

export type HomeResponse = {
    resume: {
        count_services: number
        count_collabs: number
        count_notifications: number
    }
    services: Pick<TService, 'startDate' | 'code' | 'endDate' | 'status'>[]
    notifications: []
}
