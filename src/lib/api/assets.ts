import type {
  PaginatedResponse,
  AssetListItem,
  Asset,
  AssetSearchParams,
  WorkflowHistoryItem,
  ChecklistItem,
  Platform,
} from '@/types'
import { apiClient } from './client'

/**
 * Fetch paginated list of assets with optional filtering.
 */
export async function getAssets(
  params: AssetSearchParams = {}
): Promise<PaginatedResponse<AssetListItem>> {
  // Build query string from params
  const searchParams = new URLSearchParams()

  if (params.query) searchParams.set('query', params.query)
  if (params.type) searchParams.set('type', params.type)
  if (params.status) searchParams.set('status', params.status)
  if (params.platform) searchParams.set('platform', params.platform)
  if (params.contributorId) searchParams.set('contributorId', params.contributorId)
  if (params.genre) searchParams.set('genre', params.genre)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const queryString = searchParams.toString()
  const endpoint = queryString ? `/assets?${queryString}` : '/assets'

  return apiClient.get<PaginatedResponse<AssetListItem>>(endpoint)
}

/**
 * Fetch detailed information for a specific asset.
 */
export async function getAsset(id: string): Promise<Asset> {
  return apiClient.get<Asset>(`/assets/${id}`)
}

/**
 * Create a new asset.
 */
export async function createAsset(data: {
  type: Asset['type']
  title: string
  description?: string
  contributorId: string
  contributorName?: string
  fileKey: string
  genre?: string
  tags?: string[]
  platform?: Platform | 'both'
  duration?: number
  bpm?: number
  key?: string
  [key: string]: unknown
}): Promise<Asset> {
  return apiClient.post<Asset>('/assets', data)
}

/**
 * Update asset metadata.
 */
export async function updateAsset(
  id: string,
  data: Partial<Omit<Asset, 'id' | 'type' | 'createdAt' | 'updatedAt'>>
): Promise<Asset> {
  return apiClient.patch<Asset>(`/assets/${id}`, data)
}

/**
 * Fetch workflow history for an asset.
 */
export async function getWorkflowHistory(id: string): Promise<WorkflowHistoryItem[]> {
  return apiClient.get<WorkflowHistoryItem[]>(`/assets/${id}/workflow`)
}

/**
 * Approve asset at current workflow stage.
 */
export async function approveAsset(
  id: string,
  data: {
    checklist?: ChecklistItem[]
    comments?: string
    platform?: Platform | 'both'
  }
): Promise<Asset> {
  return apiClient.post<Asset>(`/assets/${id}/approve`, data)
}

/**
 * Reject asset at current workflow stage.
 * Comments are required for rejection.
 */
export async function rejectAsset(
  id: string,
  data: {
    checklist?: ChecklistItem[]
    comments: string
  }
): Promise<Asset> {
  return apiClient.post<Asset>(`/assets/${id}/reject`, data)
}

/**
 * Unpublish a published asset (takedown).
 * Can only be called on assets in 'published' state.
 */
export async function unpublishAsset(id: string): Promise<Asset> {
  return apiClient.post<Asset>(`/assets/${id}/unpublish`)
}

/**
 * Activity entry for asset audit log.
 */
export interface ActivityEntry {
  id: string
  action: string
  actorId: string
  actorName: string
  details: string
  createdAt: string
}

/**
 * Fetch activity log for an asset.
 */
export async function getAssetActivity(assetId: string): Promise<ActivityEntry[]> {
  return apiClient.get<ActivityEntry[]>(`/assets/${assetId}/activity`)
}
