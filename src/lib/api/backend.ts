/**
 * Server-only backend API client.
 *
 * Exchanges the session refresh token for a Cognito access token and
 * attaches it as an Authorization: Bearer header on every request.
 *
 * Usage (server components and route handlers only):
 *   const api = await createBackendApiClient()
 *   const data = await api.get<MyType>('/api/v1/some-endpoint')
 */
import { getSession } from '@/lib/auth'
import { refreshAccessToken } from '@/lib/auth/cognito'

const BASE_URL = process.env.BACKEND_API_BASE_URL ?? ''

export async function createBackendApiClient() {
  const session = await getSession()

  if (!session?.isValid) {
    throw new Error('No valid session — user must be authenticated')
  }

  const { access_token } = await refreshAccessToken(session.refreshToken)

  const authHeaders = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { ...authHeaders, ...init?.headers },
    })

    if (res.status === 204) return {} as T

    const body = await res.json()

    if (!res.ok) {
      throw new Error(`Backend ${res.status}: ${body?.title ?? body?.message ?? res.statusText}`)
    }

    return body as T
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}
