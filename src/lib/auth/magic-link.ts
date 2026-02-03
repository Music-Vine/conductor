import { SignJWT, jwtVerify } from 'jose'

const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes

function getMagicLinkSecret(): Uint8Array {
  const secret = process.env.MAGIC_LINK_SECRET || process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('MAGIC_LINK_SECRET or SESSION_SECRET must be set')
  }
  return new TextEncoder().encode(secret)
}

interface MagicLinkPayload {
  email: string
  expiresAt: number
  nonce: string
  rememberMe: boolean
}

/**
 * Generates a magic link token for the given email.
 *
 * In production, this would:
 * 1. Store the nonce in database (one-time use)
 * 2. Send email via SES
 * 3. Return success
 *
 * For frontend-first development, we generate the token and log it.
 *
 * @param email - User's email address
 * @param rememberMe - Whether to extend session to 30 days
 */
export async function generateMagicLinkToken(
  email: string,
  rememberMe: boolean = false
): Promise<string> {
  const nonce = crypto.randomUUID()
  const expiresAt = Date.now() + MAGIC_LINK_EXPIRY_MS

  const payload: MagicLinkPayload = {
    email,
    expiresAt,
    nonce,
    rememberMe,
  }

  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(expiresAt))
    .sign(getMagicLinkSecret())

  return token
}

/**
 * Validates a magic link token and returns the email and rememberMe preference if valid.
 *
 * In production, this would also:
 * 1. Check nonce hasn't been used (database lookup)
 * 2. Mark nonce as used
 */
export async function validateMagicLinkToken(
  token: string
): Promise<{ email: string; rememberMe: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, getMagicLinkSecret())
    const magicPayload = payload as unknown as MagicLinkPayload

    // Check expiry
    if (magicPayload.expiresAt <= Date.now()) {
      return null
    }

    // In production: check nonce hasn't been used

    return {
      email: magicPayload.email,
      rememberMe: magicPayload.rememberMe ?? false,
    }
  } catch {
    return null
  }
}

/**
 * Requests a magic link for the given email.
 *
 * This is a mock implementation for frontend development.
 * Returns the magic link URL for testing (in production, this would be sent via email).
 *
 * @param email - User's email address
 * @param rememberMe - If true, session will be extended to 30 days per CONTEXT.md
 */
export async function requestMagicLink(
  email: string,
  rememberMe: boolean = false
): Promise<{ success: boolean; debugUrl?: string }> {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false }
  }

  // In production: Check if email belongs to a staff member
  // For now, accept any valid email format

  // Include rememberMe in token so callback can use it
  const token = await generateMagicLinkToken(email, rememberMe)

  // Build magic link URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const magicLinkUrl = `${baseUrl}/magic-link?token=${token}`

  // In production: Send email via SES/SendGrid
  // For development: Log the URL and return it
  if (process.env.NODE_ENV === 'development') {
    console.log('\n=== MAGIC LINK (Development Only) ===')
    console.log(`Email: ${email}`)
    console.log(`Remember Me: ${rememberMe}`)
    console.log(`Link: ${magicLinkUrl}`)
    console.log('=====================================\n')
    return { success: true, debugUrl: magicLinkUrl }
  }

  return { success: true }
}
