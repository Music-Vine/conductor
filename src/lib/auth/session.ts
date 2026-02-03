import { cookies } from 'next/headers'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import type { SessionPayload, Session } from '@/types'

// Session durations from CONTEXT.md decisions
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours
const REMEMBER_ME_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const SESSION_COOKIE_NAME = 'conductor_session'

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Creates a new session and stores it in an HttpOnly cookie.
 * @param payload - Session data (userId, email, name, platform)
 * @param rememberMe - If true, extends session to 30 days
 */
export async function createSession(
  payload: Omit<SessionPayload, 'expiresAt' | 'rememberMe'>,
  rememberMe = false
): Promise<void> {
  const duration = rememberMe ? REMEMBER_ME_DURATION_MS : SESSION_DURATION_MS
  const expiresAt = Date.now() + duration

  const sessionPayload: SessionPayload = {
    ...payload,
    expiresAt,
    rememberMe,
  }

  const token = await new SignJWT(sessionPayload as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(expiresAt))
    .sign(getSecretKey())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  })
}

/**
 * Retrieves and validates the current session from cookies.
 * @returns Session object with validity info, or null if no valid session
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionCookie.value, getSecretKey())
    const sessionPayload = payload as unknown as SessionPayload

    const now = Date.now()
    const isValid = sessionPayload.expiresAt > now
    const timeRemaining = Math.max(0, sessionPayload.expiresAt - now)

    return {
      ...sessionPayload,
      isValid,
      timeRemaining,
    }
  } catch (error) {
    // Invalid or expired token
    console.error('Session validation failed:', error)
    return null
  }
}

/**
 * Extends the current session if user is active.
 * Called by middleware on each authenticated request.
 * Only extends if session is valid and not using remember-me (which has fixed expiry).
 */
export async function updateSession(): Promise<void> {
  const session = await getSession()

  if (!session || !session.isValid) {
    return
  }

  // Don't extend remember-me sessions - they have fixed 30-day expiry
  if (session.rememberMe) {
    return
  }

  // Extend session by creating a new one with same data
  await createSession(
    {
      userId: session.userId,
      email: session.email,
      name: session.name,
      platform: session.platform,
    },
    false
  )
}

/**
 * Destroys the current session by clearing the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Gets session payload for client-side use (non-sensitive data only).
 * This version works in both server and client contexts.
 */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const session = await getSession()
  if (!session || !session.isValid) {
    return null
  }

  // Return only the payload, not the runtime properties
  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    platform: session.platform,
    expiresAt: session.expiresAt,
    rememberMe: session.rememberMe,
  }
}
