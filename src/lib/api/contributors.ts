import type {
  PaginatedResponse,
  ContributorListItem,
  Contributor,
  ContributorSearchParams,
  ContributorPayee,
} from '@/types'
import { apiClient } from './client'

/**
 * Fetch paginated list of contributors with optional filtering.
 */
export async function fetchContributors(
  params: ContributorSearchParams = {}
): Promise<PaginatedResponse<ContributorListItem>> {
  // Build query string from params
  const searchParams = new URLSearchParams()

  if (params.query) searchParams.set('query', params.query)
  if (params.status) searchParams.set('status', params.status)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const queryString = searchParams.toString()
  const endpoint = queryString ? `/contributors?${queryString}` : '/contributors'

  return apiClient.get<PaginatedResponse<ContributorListItem>>(endpoint)
}

/**
 * Fetch detailed information for a specific contributor.
 */
export async function fetchContributor(id: string): Promise<Contributor> {
  return apiClient.get<Contributor>(`/contributors/${id}`)
}

/**
 * Fetch all payees assigned to a contributor.
 */
export async function fetchContributorPayees(id: string): Promise<ContributorPayee[]> {
  return apiClient.get<ContributorPayee[]>(`/contributors/${id}/payees`)
}

/**
 * Fetch all assets associated with a contributor.
 */
export async function fetchContributorAssets(id: string): Promise<unknown[]> {
  return apiClient.get<unknown[]>(`/contributors/${id}/assets`)
}

/**
 * Create a new contributor.
 */
export async function createContributor(
  data: Partial<Contributor>
): Promise<Contributor> {
  return apiClient.post<Contributor>('/contributors', data)
}

/**
 * Update an existing contributor.
 */
export async function updateContributor(
  id: string,
  data: Partial<Contributor>
): Promise<Contributor> {
  return apiClient.put<Contributor>(`/contributors/${id}`, data)
}

/**
 * Save payee assignments for a contributor.
 * Replaces all existing payee assignments with the provided list.
 */
export async function saveContributorPayees(
  id: string,
  payees: Array<{ payeeId: string; percentageRate: number; effectiveDate: string; notes?: string }>
): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>(
    `/contributors/${id}/payees`,
    { payees }
  )
}
