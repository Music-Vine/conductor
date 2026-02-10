import type { Platform } from './platform'

/**
 * Collection of curated assets.
 * Used to group assets thematically (e.g., "Summer Vibes 2026", "Piano Instrumentals").
 */
export interface Collection {
  id: string
  title: string
  description?: string
  coverImageUrl?: string
  platform: Platform | 'both'
  assetIds: string[]
  assetCount: number
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

/**
 * Simplified collection type for table display.
 */
export interface CollectionListItem {
  id: string
  title: string
  platform: Platform | 'both'
  assetCount: number
  createdAt: string
}
