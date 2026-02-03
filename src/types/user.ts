import type { Platform } from './platform'

/**
 * User account status.
 */
export type UserStatus = 'active' | 'suspended'

/**
 * Subscription tier levels.
 */
export type SubscriptionTier = 'free' | 'creator' | 'pro' | 'enterprise'

/**
 * OAuth provider connection details.
 */
export interface OAuthConnection {
  provider: 'google' | 'facebook'
  connectedAt: string
  email: string
}

/**
 * User list item for table display.
 */
export interface UserListItem {
  id: string
  email: string
  name: string | null
  username: string | null
  status: UserStatus
  subscriptionTier: SubscriptionTier
  platform: Platform
  lastLoginAt: string | null
  createdAt: string
}

/**
 * Detailed user information for detail view.
 */
export interface UserDetail extends UserListItem {
  suspendedAt: string | null
  suspendedReason: string | null
  oauthConnections: OAuthConnection[]
  subscription: {
    tier: SubscriptionTier
    startedAt: string
    expiresAt: string | null
    billingEmail: string
  }
  downloadCount: number
  licenseCount: number
}

/**
 * User search and filter parameters.
 */
export interface UserSearchParams {
  query?: string
  status?: UserStatus
  tier?: SubscriptionTier
  platform?: Platform
  page?: number
  limit?: number
}
