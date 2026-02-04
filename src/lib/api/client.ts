import type { ApiResponse, ApiError, ApiClientConfig } from '@/types'

/**
 * Custom API Error class with structured error data.
 */
export class ApiClientError extends Error {
  public code: string
  public status: number
  public details?: Record<string, unknown>

  constructor(message: string, code: string, status: number, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
    this.details = details
  }
}

/**
 * Default API client configuration.
 */
const defaultConfig: ApiClientConfig = {
  baseUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
}

/**
 * Creates an API client with the given configuration.
 */
export function createApiClient(config: Partial<ApiClientConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  async function request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Construct absolute URL for server-side requests
    let url = `${finalConfig.baseUrl}${endpoint}`

    // If running server-side (typeof window === 'undefined'), convert to absolute URL
    if (typeof window === 'undefined') {
      // Use environment variable or default to localhost in development
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      url = `${baseUrl}${finalConfig.baseUrl}${endpoint}`
    }

    const headers = new Headers({
      ...finalConfig.headers,
      ...options.headers,
    })

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for session auth
    })

    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    // Try to parse JSON response
    let data: ApiResponse<T> | ApiError

    try {
      data = await response.json()
    } catch {
      // Non-JSON response
      if (!response.ok) {
        throw new ApiClientError(
          `Request failed: ${response.statusText}`,
          'UNKNOWN_ERROR',
          response.status
        )
      }
      return {} as T
    }

    // Check for API error response
    if (!response.ok) {
      const error = data as ApiError
      throw new ApiClientError(
        error.message || `Request failed with status ${response.status}`,
        error.code || 'API_ERROR',
        response.status,
        error.details
      )
    }

    // Return data from successful response
    // For API responses that follow ApiResponse<T> pattern, extract .data
    // For responses that ARE the data (like PaginatedResponse), return as-is
    const successResponse = data as ApiResponse<T>
    if (successResponse.data !== undefined) {
      return successResponse.data
    }
    return data as T
  }

  return {
    /**
     * GET request
     */
    get<T>(endpoint: string, options?: RequestInit): Promise<T> {
      return request<T>(endpoint, { ...options, method: 'GET' })
    },

    /**
     * POST request
     */
    post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
      return request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      })
    },

    /**
     * PUT request
     */
    put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
      return request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      })
    },

    /**
     * PATCH request
     */
    patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
      return request<T>(endpoint, {
        ...options,
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
      })
    },

    /**
     * DELETE request
     */
    delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
      return request<T>(endpoint, { ...options, method: 'DELETE' })
    },

    /**
     * Raw request for custom methods or configurations
     */
    request,
  }
}

/**
 * Default API client instance.
 * Use this for most API calls.
 */
export const apiClient = createApiClient()

/**
 * Create a platform-specific API client.
 * The baseUrl is determined by the platform atom, but since atoms are
 * client-side only, this should be called from components with the
 * platform-specific base URL.
 */
export function createPlatformApiClient(baseUrl: string) {
  return createApiClient({ baseUrl })
}
