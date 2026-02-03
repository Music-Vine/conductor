import type { Platform } from './platform'

export interface SessionPayload {
  userId: string
  email: string
  name: string
  platform: Platform
  expiresAt: number
  rememberMe: boolean
}

export interface Session extends SessionPayload {
  // Additional runtime properties
  isValid: boolean
  timeRemaining: number
}

export interface LoginRequest {
  email: string
}

export interface MagicLinkCallbackParams {
  token: string
  signature: string
}

export interface AuthResult {
  success: boolean
  session?: SessionPayload
  error?: string
}
