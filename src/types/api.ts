export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

export interface ApiClientConfig {
  baseUrl: string
  headers?: Record<string, string>
}
