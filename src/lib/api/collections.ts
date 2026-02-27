import type { Collection, CollectionListItem } from '@/types/collection'
import type { PaginatedResponse } from '@/types/api'
import type { Platform } from '@/types/platform'
import { apiClient } from './client'

export interface GetCollectionsParams {
  platform?: Platform | 'both'
  query?: string
  page?: number
  limit?: number
}

export interface CreateCollectionData {
  title: string
  description?: string
  platform: Platform | 'both'
  assetIds?: string[]
}

export interface UpdateCollectionData {
  title?: string
  description?: string
  platform?: Platform | 'both'
}

/**
 * Get paginated list of collections.
 */
export async function getCollections(
  params: GetCollectionsParams = {}
): Promise<PaginatedResponse<CollectionListItem>> {
  const searchParams = new URLSearchParams()

  if (params.platform) searchParams.set('platform', params.platform)
  if (params.query) searchParams.set('query', params.query)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const url = `/collections${searchParams.toString() ? `?${searchParams}` : ''}`
  return apiClient.get<PaginatedResponse<CollectionListItem>>(url)
}

/**
 * Get a single collection by ID.
 */
export async function getCollection(id: string): Promise<Collection> {
  return apiClient.get<Collection>(`/collections/${id}`)
}

/**
 * Create a new collection.
 */
export async function createCollection(data: CreateCollectionData): Promise<Collection> {
  return apiClient.post<Collection>('/collections', data)
}

/**
 * Update an existing collection.
 */
export async function updateCollection(
  id: string,
  data: UpdateCollectionData
): Promise<Collection> {
  return apiClient.patch<Collection>(`/collections/${id}`, data)
}

/**
 * Delete a collection.
 */
export async function deleteCollection(id: string): Promise<void> {
  await apiClient.delete(`/collections/${id}`)
}

/**
 * Add assets to a collection.
 */
export async function addAssetsToCollection(
  collectionId: string,
  assetIds: string[]
): Promise<Collection> {
  return apiClient.post<Collection>(`/collections/${collectionId}/assets`, {
    assetIds,
  })
}

/**
 * Remove an asset from a collection.
 */
export async function removeAssetFromCollection(
  collectionId: string,
  assetId: string
): Promise<Collection> {
  return apiClient.delete<Collection>(
    `/collections/${collectionId}/assets/${assetId}`
  )
}
