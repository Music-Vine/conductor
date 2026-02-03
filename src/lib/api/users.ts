import type { PaginatedResponse, UserListItem, UserDetail, UserSearchParams } from '@/types'
import { apiClient } from './client'

/**
 * Fetch paginated list of users with optional filtering.
 */
export async function fetchUsers(
  params: UserSearchParams = {}
): Promise<PaginatedResponse<UserListItem>> {
  // Build query string from params
  const searchParams = new URLSearchParams()

  if (params.query) searchParams.set('query', params.query)
  if (params.status) searchParams.set('status', params.status)
  if (params.tier) searchParams.set('tier', params.tier)
  if (params.platform) searchParams.set('platform', params.platform)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const queryString = searchParams.toString()
  const endpoint = queryString ? `/users?${queryString}` : '/users'

  return apiClient.get<PaginatedResponse<UserListItem>>(endpoint)
}

/**
 * Fetch detailed information for a specific user.
 */
export async function fetchUser(id: string): Promise<UserDetail> {
  return apiClient.get<UserDetail>(`/users/${id}`)
}
