import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchPayee } from '@/lib/api/payees'
import { apiClient } from '@/lib/api/client'
import { PayeeDetailTabs } from './components'
import type { PayeeContributorEntry } from './components'

interface PayeeDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

/**
 * Payee detail page with tabbed navigation.
 * Shows profile information and reverse contributor lookup organized into tabs.
 */
export default async function PayeeDetailPage({
  params,
  searchParams,
}: PayeeDetailPageProps) {
  // Await params and searchParams (Next.js 15 pattern)
  const { id } = await params
  const { tab } = await searchParams

  // Fetch payee detail and contributors in parallel
  let payee
  let contributors: PayeeContributorEntry[] = []

  try {
    ;[payee, contributors] = await Promise.all([
      fetchPayee(id),
      apiClient.get<PayeeContributorEntry[]>(`/payees/${id}/contributors`),
    ])
  } catch (error) {
    notFound()
  }

  // Determine active tab (default to 'profile')
  const validTabs = ['profile', 'contributors']
  const activeTab = tab && validTabs.includes(tab) ? tab : 'profile'

  // Status badge classes
  const statusBadgeClass =
    payee.status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  const statusLabel = payee.status === 'active' ? 'Active' : 'Inactive'

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/payees"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Payees
      </Link>

      {/* Payee header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{payee.name}</h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-gray-600">{payee.email}</p>
          <p className="mt-1 text-sm text-gray-500">ID: {payee.id}</p>
        </div>
      </div>

      {/* Tabs */}
      <PayeeDetailTabs
        payee={payee}
        contributors={contributors}
        activeTab={activeTab}
      />
    </div>
  )
}
