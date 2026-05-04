export type PaginatedResponse<T> = {
    items: T[]
    last_evaluated_key?: string
}

export type FullResponse<T> = {
    items: T[]
    length: number
}
