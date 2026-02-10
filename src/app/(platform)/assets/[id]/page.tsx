import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAsset } from '@/lib/api/assets'
import { getStateLabel, getStateColor } from '@/lib/workflow/states'
import { AssetDetailTabs } from './components'

interface AssetDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function AssetDetailPage({ params, searchParams }: AssetDetailPageProps) {
  const { id } = await params
  const { tab } = await searchParams

  let asset
  try {
    asset = await getAsset(id)
  } catch (error) {
    notFound()
  }

  // Determine active tab (default to 'overview')
  const validTabs = ['overview', 'workflow', 'collections', 'activity']
  const activeTab = tab && validTabs.includes(tab) ? tab : 'overview'

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/assets"
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
        Back to assets
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{asset.title}</h1>
            <AssetTypeBadge type={asset.type} />
            <WorkflowStatusBadge status={asset.status} />
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Uploaded by {asset.contributorName} on {new Date(asset.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <PlatformBadge platform={asset.platform} />
        </div>
      </div>

      {/* Tabs */}
      <AssetDetailTabs asset={asset} currentTab={activeTab} />
    </div>
  )
}

function AssetTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    music: 'Music',
    sfx: 'SFX',
    'motion-graphics': 'Motion Graphics',
    lut: 'LUT',
    'stock-footage': 'Stock Footage',
  }
  const colors: Record<string, string> = {
    music: 'bg-purple-100 text-purple-800',
    sfx: 'bg-blue-100 text-blue-800',
    'motion-graphics': 'bg-green-100 text-green-800',
    lut: 'bg-yellow-100 text-yellow-800',
    'stock-footage': 'bg-orange-100 text-orange-800',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
      {labels[type] || type}
    </span>
  )
}

function WorkflowStatusBadge({ status }: { status: string }) {
  const label = getStateLabel(status as any)
  const color = getStateColor(status as any)

  // Convert text color to badge background color
  const bgColors: Record<string, string> = {
    'text-green-600': 'bg-green-100 text-green-800',
    'text-red-600': 'bg-red-100 text-red-800',
    'text-gray-500': 'bg-gray-100 text-gray-800',
    'text-blue-600': 'bg-blue-100 text-blue-800',
  }

  const badgeColor = bgColors[color] || 'bg-gray-100 text-gray-800'

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
      {label}
    </span>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const config: Record<string, { label: string; color: string }> = {
    'music-vine': { label: 'Music Vine', color: 'bg-red-100 text-red-800' },
    'uppbeat': { label: 'Uppbeat', color: 'bg-pink-100 text-pink-800' },
    'both': { label: 'Both Platforms', color: 'bg-gray-100 text-gray-800' },
  }
  const { label, color } = config[platform] || { label: platform, color: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
