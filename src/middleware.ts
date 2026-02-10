import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import type { SessionPayload } from '@/types'

const SESSION_COOKIE_NAME = 'conductor_session'

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/magic-link',
  '/api/auth',
  '/api/users', // Mock user management API for frontend development
  '/api/assets', // Mock asset management API for frontend development
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path))
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

async function validateSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const sessionPayload = payload as unknown as SessionPayload

    // Check if session is expired
    if (sessionPayload.expiresAt <= Date.now()) {
      return null
    }

    return sessionPayload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)

  // No session - redirect to login
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validate session
  const session = await validateSession(sessionCookie.value)

  if (!session) {
    // Invalid or expired session - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    // Clear invalid cookie
    response.cookies.delete(SESSION_COOKIE_NAME)
    return response
  }

  // Valid session - add user context to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.userId)
  requestHeaders.set('x-user-email', session.email)
  requestHeaders.set('x-user-name', session.name)
  requestHeaders.set('x-platform', session.platform)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Auto-refresh session (non-blocking)
  // Note: We can't call updateSession() here because cookies() isn't available
  // in middleware. Instead, we'll extend the cookie directly if needed.
  if (!session.rememberMe) {
    const SESSION_DURATION_MS = 8 * 60 * 60 * 1000
    const newExpiresAt = Date.now() + SESSION_DURATION_MS

    // Only extend if more than 1 hour has passed since last extension
    // This prevents excessive cookie updates
    const timeSinceLastExtend = session.expiresAt - (SESSION_DURATION_MS)
    const shouldExtend = Date.now() > timeSinceLastExtend + (60 * 60 * 1000)

    if (shouldExtend) {
      // We need to create a new JWT with extended expiry
      // This requires importing SignJWT
      const { SignJWT } = await import('jose')

      const newPayload: SessionPayload = {
        ...session,
        expiresAt: newExpiresAt,
      }

      const token = await new SignJWT(newPayload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(new Date(newExpiresAt))
        .sign(getSecretKey())

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(newExpiresAt),
        path: '/',
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
