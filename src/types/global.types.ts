export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error?: string
  message?: string
  timestamp: string
  traceId?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
