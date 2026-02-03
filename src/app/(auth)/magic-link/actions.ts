'use server'

import { redirect } from 'next/navigation'
import { validateMagicLinkToken } from '@/lib/auth'
import { createSession } from '@/lib/auth'

export interface MagicLinkState {
  error?: string
}

export async function validateMagicLink(token: string): Promise<MagicLinkState> {
  const result = await validateMagicLinkToken(token)

  if (!result) {
    return { error: 'This magic link is invalid or has expired. Please request a new one.' }
  }

  // In production: Look up user in database by email
  // For development: Create a mock user session
  const mockUser = {
    userId: crypto.randomUUID(),
    email: result.email,
    name: result.email.split('@')[0], // Use email prefix as name for demo
    platform: 'music-vine' as const,
  }

  // Use rememberMe from the magic link token (set during login)
  // Per CONTEXT.md: "Remember me option extends session to 30 days"
  // Session cookies persist across browser sessions when rememberMe is true
  await createSession(mockUser, result.rememberMe)

  // Redirect to dashboard
  redirect('/')
}
