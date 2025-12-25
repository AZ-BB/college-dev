export interface GeneralResponse<T> {
    data: T | null
    error?: string
    message?: string
    statusCode?: 200 | 400 | 401 | 403 | 404 | 500
}