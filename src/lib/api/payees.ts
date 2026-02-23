import type {
  PaginatedResponse,
  PayeeListItem,
  Payee,
  PayeeSearchParams,
  ContributorListItem,
} from '@/types'
import { apiClient } from './client'

/**
 * Fetch paginated list of payees with optional filtering.
 */
export async function fetchPayees(
  params: PayeeSearchParams = {}
): Promise<PaginatedResponse<PayeeListItem>> {
  // Build query string from params
  const searchParams = new URLSearchParams()

  if (params.query) searchParams.set('query', params.query)
  if (params.status) searchParams.set('status', params.status)
  if (params.paymentMethod) searchParams.set('paymentMethod', params.paymentMethod)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const queryString = searchParams.toString()
  const endpoint = queryString ? `/payees?${queryString}` : '/payees'

  return apiClient.get<PaginatedResponse<PayeeListItem>>(endpoint)
}

/**
 * Fetch detailed information for a specific payee.
 */
export async function fetchPayee(id: string): Promise<Payee> {
  return apiClient.get<Payee>(`/payees/${id}`)
}

/**
 * Fetch all contributors assigned to a payee.
 */
export async function fetchPayeeContributors(id: string): Promise<ContributorListItem[]> {
  return apiClient.get<ContributorListItem[]>(`/payees/${id}/contributors`)
}

/**
 * Create a new payee.
 */
export async function createPayee(data: Partial<Payee>): Promise<Payee> {
  return apiClient.post<Payee>('/payees', data)
}

/**
 * Update an existing payee.
 */
export async function updatePayee(id: string, data: Partial<Payee>): Promise<Payee> {
  return apiClient.put<Payee>(`/payees/${id}`, data)
}
