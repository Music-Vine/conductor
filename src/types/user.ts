import type { Platform } from './platform'

/**
 * User account status.
 */
export type UserStatus = 'active' | 'suspended'

/**
 * Subscription tier levels.
 */
export type SubscriptionTier = 'free' | 'essentials' | 'creator' | 'pro' | 'enterprise'

/**
 * OAuth provider connection details.
 */
export interface OAuthConnection {
  provider: 'google'
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

/**
 * Asset type for downloads and licenses.
 * Note: This is different from the catalog AssetType in asset.ts.
 */
export type DownloadAssetType = 'music' | 'sfx' | 'motion' | 'lut' | 'footage'

/**
 * License type levels.
 */
export type LicenseType = 'standard' | 'premium' | 'enterprise'

/**
 * Download record for a user.
 */
export interface Download {
  id: string
  assetId: string
  assetName: string
  assetType: DownloadAssetType
  downloadedAt: string
  format: string
}

/**
 * License record for a user.
 */
export interface License {
  id: string
  assetId: string
  assetName: string
  licenseType: LicenseType
  grantedAt: string
  expiresAt: string | null
}

/**
 * Activity item for combined downloads + licenses timeline.
 */
export interface ActivityItem {
  type: 'download' | 'license'
  timestamp: string
  data: Download | License
}
