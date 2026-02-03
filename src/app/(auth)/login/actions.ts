'use server'

import { requestMagicLink } from '@/lib/auth'

export interface LoginState {
  success: boolean
  message?: string
  debugUrl?: string // Only in development
}

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email')
  const rememberMe = formData.get('rememberMe') === 'on'

  if (typeof email !== 'string' || !email) {
    return {
      success: false,
      message: 'Please enter your email address',
    }
  }

  // Pass rememberMe preference to magic link generation
  // The token will include this preference for the callback to use
  const result = await requestMagicLink(email, rememberMe)

  if (!result.success) {
    return {
      success: false,
      message: 'Please enter a valid email address',
    }
  }

  return {
    success: true,
    message: 'Check your email for a magic link to sign in',
    debugUrl: result.debugUrl, // Only present in development
  }
}
