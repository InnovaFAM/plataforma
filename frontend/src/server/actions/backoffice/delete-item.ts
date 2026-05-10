'use server'
import { TBackOfficeDialogDelete } from '@/app/(protected-pages)/backoffice/types'
import { ServerResponse } from '@/services/ApiService'
import { apiDeleteItem } from '@/services/BackofficeService'

export const deleteItem = async (
    data: TBackOfficeDialogDelete,
): Promise<ServerResponse<void>> => {
    return await apiDeleteItem(data)
}
