import { NextRequest, NextResponse } from 'next/server'

/**
 * Feature flag: when true, route handlers forward requests to the real backend
 * instead of returning mock data.
 *
 * Set NEXT_PUBLIC_USE_REAL_API=true in your environment to enable.
 */
export const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'

/**
 * Proxy a Next.js route handler request to the real backend API.
 *
 * Usage in route handler:
 * ```typescript
 * const result = await proxyToBackend(request, '/admin/users')
 * if (result === null) return NextResponse.json(generateMockData()) // mock mode
 * if (result instanceof NextResponse) return result // error response
 * const adapted = adaptResponse(result.data) // success — adapt shape
 * return NextResponse.json(adapted)
 * ```
 *
 * @param request - The incoming NextRequest from the route handler
 * @param backendPath - The path on the backend (e.g. '/admin/users')
 * @param options - Optional method, body, and timeout overrides
 * @returns null if mock mode, NextResponse if error, { data } if success
 */
export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  options?: {
    method?: string
    body?: unknown
    timeout?: number
  }
): Promise<{ data: unknown } | NextResponse | null> {
  // Feature flag check — return null so caller can fall through to mock data
  if (!USE_REAL_API) {
    return null
  }

  const baseUrl = process.env.BACKEND_API_BASE_URL
  if (!baseUrl) {
    throw new Error(
      'BACKEND_API_BASE_URL environment variable is not set. ' +
        'Please configure it in your .env.local file when using NEXT_PUBLIC_USE_REAL_API=true.'
    )
  }

  // Build target URL, forwarding query params from the incoming request
  const targetUrl = new URL(backendPath, baseUrl)
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value)
  })

  // Build request headers to forward to backend
  const headers: Record<string, string> = {
    'X-Platform': request.headers.get('x-platform') ?? 'music-vine',
    'X-Conductor-User': request.headers.get('x-user-id') ?? '',
  }

  if (process.env.BACKEND_API_SECRET) {
    headers['Authorization'] = `Bearer ${process.env.BACKEND_API_SECRET}`
  }

  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const method = options?.method ?? request.method

  try {
    const backendResponse = await fetch(targetUrl.toString(), {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(options?.timeout ?? 10_000),
    })

    if (!backendResponse.ok) {
      console.error(
        `[proxyToBackend] Backend returned ${backendResponse.status} for ${method} ${backendPath}`
      )
      return NextResponse.json(
        { code: 'BACKEND_ERROR', message: 'Backend returned error' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return { data }
  } catch (error) {
    console.error(`[proxyToBackend] Network/timeout error for ${method} ${backendPath}:`, error)
    return NextResponse.json(
      { code: 'BACKEND_UNAVAILABLE', message: 'Backend request failed' },
      { status: 502 }
    )
  }
}
