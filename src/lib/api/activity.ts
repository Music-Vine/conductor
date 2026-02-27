import type { PaginatedResponse, SystemActivityEntry, ActivityEntityType } from '@/types'
import { apiClient } from './client'

export interface ActivityParams {
  page?: number
  limit?: number
  entityType?: ActivityEntityType
  entityId?: string
}

/**
 * Fetch paginated system-wide activity entries with optional filtering.
 *
 * Supports filtering by entityType and entityId, useful for entity-specific
 * activity views on detail pages and the full Activity page.
 */
export async function getActivity(
  params: ActivityParams = {}
): Promise<PaginatedResponse<SystemActivityEntry>> {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.entityType) searchParams.set('entityType', params.entityType)
  if (params.entityId) searchParams.set('entityId', params.entityId)

  const queryString = searchParams.toString()
  const endpoint = queryString ? `/activity?${queryString}` : '/activity'

  return apiClient.get<PaginatedResponse<SystemActivityEntry>>(endpoint)
}

/**
 * Convenience wrapper for the dashboard widget.
 * Returns the most recent N activity entries (default: 10).
 */
export async function getRecentActivity(
  limit = 10
): Promise<PaginatedResponse<SystemActivityEntry>> {
  return getActivity({ limit, page: 1 })
}
