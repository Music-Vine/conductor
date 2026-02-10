import { type NextRequest, NextResponse } from 'next/server'
import { validateMagicLinkToken, createSession } from '@/lib/auth'

/**
 * Magic link callback route handler.
 * Validates token and creates session, then redirects to dashboard.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    // Redirect to login with error
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'No magic link token provided')
    return NextResponse.redirect(loginUrl)
  }

  // Validate the magic link token
  const result = await validateMagicLinkToken(token)

  if (!result) {
    // Redirect to login with error
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'This magic link is invalid or has expired')
    return NextResponse.redirect(loginUrl)
  }

  // Create mock user session
  const mockUser = {
    userId: crypto.randomUUID(),
    email: result.email,
    name: result.email.split('@')[0],
    platform: 'music-vine' as const,
  }

  // Create session (sets cookie)
  await createSession(mockUser, result.rememberMe)

  // Redirect to dashboard
  return NextResponse.redirect(new URL('/', request.url))
}
