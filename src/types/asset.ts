import type { Platform } from './platform'
import type { MusicWorkflowState, SimpleWorkflowState } from './workflow'

/**
 * Asset type discriminator.
 */
export type AssetType = 'music' | 'sfx' | 'motion-graphics' | 'lut' | 'stock-footage'

/**
 * Base asset fields shared across all asset types.
 */
export interface BaseAsset {
  id: string
  title: string
  description?: string
  contributorId: string
  contributorName: string

  // File information
  fileKey: string
  fileUrl: string
  fileSize: number

  // Metadata
  tags: string[]

  // Workflow timestamps
  createdAt: string
  updatedAt: string
  submittedAt?: string
  approvedAt?: string
  publishedAt?: string
}

/**
 * Music asset with multi-stage workflow.
 * Can be assigned to Music Vine, Uppbeat, or both platforms.
 */
export interface MusicAsset extends BaseAsset {
  type: 'music'
  platform: Platform | 'both'
  status: MusicWorkflowState

  // Music-specific metadata
  genre: string
  bpm?: number
  key?: string
  duration: number
  instruments?: string[]
}

/**
 * SFX asset with simple workflow.
 * Locked to Uppbeat platform only.
 */
export interface SfxAsset extends BaseAsset {
  type: 'sfx'
  platform: 'uppbeat'
  status: SimpleWorkflowState

  // SFX-specific metadata
  category: string
  duration: number
}

/**
 * Motion graphics asset with simple workflow.
 * Locked to Uppbeat platform only.
 */
export interface MotionGraphicsAsset extends BaseAsset {
  type: 'motion-graphics'
  platform: 'uppbeat'
  status: SimpleWorkflowState

  // Motion graphics-specific metadata
  resolution: string
  duration: number
  format: string
}

/**
 * LUT asset with simple workflow.
 * Locked to Uppbeat platform only.
 */
export interface LutAsset extends BaseAsset {
  type: 'lut'
  platform: 'uppbeat'
  status: SimpleWorkflowState

  // LUT-specific metadata
  format: string
  compatibleSoftware: string[]
}

/**
 * Stock footage asset with simple workflow.
 * Locked to Uppbeat platform only.
 */
export interface StockFootageAsset extends BaseAsset {
  type: 'stock-footage'
  platform: 'uppbeat'
  status: SimpleWorkflowState

  // Stock footage-specific metadata
  resolution: string
  duration: number
  frameRate: number
}

/**
 * Discriminated union of all asset types.
 * TypeScript can narrow this based on the 'type' field.
 */
export type Asset =
  | MusicAsset
  | SfxAsset
  | MotionGraphicsAsset
  | LutAsset
  | StockFootageAsset

/**
 * Type guard to check if an asset is a music asset.
 */
export function isMusicAsset(asset: Asset): asset is MusicAsset {
  return asset.type === 'music'
}

/**
 * Type guard to check if an asset uses multi-stage workflow.
 * Currently only music assets have multi-stage workflow.
 */
export function hasMultiStageWorkflow(asset: Asset): asset is MusicAsset {
  return asset.type === 'music'
}

/**
 * Simplified asset type for table display.
 * Contains only essential fields needed in list views.
 */
export interface AssetListItem {
  id: string
  title: string
  type: AssetType
  contributorName: string
  platform: Platform | 'both'
  status: MusicWorkflowState | SimpleWorkflowState
  genre?: string
  duration?: number
  createdAt: string
  updatedAt: string
}

/**
 * Asset search and filter parameters.
 */
export interface AssetSearchParams {
  query?: string
  type?: AssetType
  status?: MusicWorkflowState | SimpleWorkflowState
  platform?: Platform | 'both'
  contributorId?: string
  genre?: string
  page?: number
  limit?: number
}
