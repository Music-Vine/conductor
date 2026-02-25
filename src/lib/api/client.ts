import type { ApiResponse, ApiError, ApiClientConfig } from '@/types'

/**
 * Determine the base URL for server-side requests.
 *
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL environment variable (explicit override)
 * 2. Host header from the incoming Next.js request (dynamic, port-aware)
 * 3. http://localhost:3000 as a last resort
 *
 * This prevents "fetch failed" errors when the dev server runs on a port
 * other than 3000 (e.g. when another Next.js app already occupies port 3000).
 */
async function resolveServerBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  try {
    // headers() is available in Next.js App Router server components and route handlers
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const host = headersList.get('host')
    if (host) {
      // Respect x-forwarded-proto for reverse-proxy / HTTPS deployments
      const proto = headersList.get('x-forwarded-proto') ?? 'http'
      return `${proto}://${host}`
    }
  } catch {
    // Not in a Next.js request context (e.g. build time) – fall through
  }

  return 'http://localhost:3000'
}

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

    // If running server-side (typeof window === 'undefined'), convert to absolute URL.
    // Uses resolveServerBaseUrl() which reads the incoming request host header so the
    // URL is correct regardless of which port the dev server is running on.
    if (typeof window === 'undefined') {
      const serverBaseUrl = await resolveServerBaseUrl()
      url = `${serverBaseUrl}${finalConfig.baseUrl}${endpoint}`
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
    // Special handling for different response patterns:
    // 1. PaginatedResponse: { data: T[], pagination: {...} } - return as-is
    // 2. ApiResponse: { data: T } - unwrap and return T
    // 3. Direct data: T - return as-is
    const responseObj = data as any

    // If response has pagination field, it's a PaginatedResponse - return entire object
    if (responseObj.pagination !== undefined) {
      return data as T
    }

    // If response has data field (but no pagination), it's an ApiResponse wrapper - unwrap it
    if (responseObj.data !== undefined) {
      return responseObj.data
    }

    // Otherwise return the data as-is
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
