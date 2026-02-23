import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  fetchContributor,
  fetchContributorPayees,
  fetchContributorAssets,
} from '@/lib/api/contributors'
import { ContributorDetailTabs } from './components/ContributorDetailTabs'
import type { ContributorAssetListItem } from './components/AssetsTab'

interface ContributorDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

/**
 * Contributor detail page with tabbed navigation.
 * Shows profile info, payee relationships, and associated assets.
 */
export default async function ContributorDetailPage({
  params,
  searchParams,
}: ContributorDetailPageProps) {
  // Await params and searchParams (Next.js 15 pattern)
  const { id } = await params
  const { tab } = await searchParams

  // Fetch contributor data server-side (all in parallel)
  let contributor
  let payees
  let assets
  try {
    ;[contributor, payees, assets] = await Promise.all([
      fetchContributor(id),
      fetchContributorPayees(id),
      fetchContributorAssets(id),
    ])
  } catch {
    notFound()
  }

  // Determine active tab (default to 'profile')
  const validTabs = ['profile', 'payees', 'assets']
  const activeTab = tab && validTabs.includes(tab) ? tab : 'profile'

  // Status badge styling
  const statusBadgeClass =
    contributor.status === 'active'
      ? 'inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800'
      : contributor.status === 'inactive'
        ? 'inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800'
        : 'inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800'

  const statusLabel =
    contributor.status === 'active'
      ? 'Active'
      : contributor.status === 'inactive'
        ? 'Inactive'
        : 'Pending'

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/contributors"
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
        Back to Contributors
      </Link>

      {/* Contributor header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {/* Name */}
          <h1 className="text-2xl font-semibold text-gray-900">
            {contributor.name}
          </h1>

          {/* Email */}
          <p className="mt-1 text-gray-600">{contributor.email}</p>

          {/* Status and ID */}
          <div className="mt-3 flex items-center gap-4">
            <span className={statusBadgeClass}>{statusLabel}</span>
            <span className="text-sm text-gray-500">ID: {contributor.id}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ContributorDetailTabs
        contributor={contributor}
        payees={payees}
        assets={assets as ContributorAssetListItem[]}
        activeTab={activeTab}
      />
    </div>
  )
}
