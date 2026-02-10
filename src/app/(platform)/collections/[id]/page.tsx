import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@music-vine/cadence'
import { getCollection } from '@/lib/api/collections'
import { getAsset } from '@/lib/api/assets'

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params

  let collection
  try {
    collection = await getCollection(id)
  } catch (error) {
    notFound()
  }

  // Fetch asset details for assets in collection (limit to first 100)
  const assetIds = collection.assetIds.slice(0, 100)
  const assets = await Promise.all(
    assetIds.map(async (assetId) => {
      try {
        return await getAsset(assetId)
      } catch {
        return null
      }
    })
  )
  const validAssets = assets.filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/collections"
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
        Back to collections
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{collection.title}</h1>
            <PlatformBadge platform={collection.platform} />
          </div>
          {collection.description && (
            <p className="mt-2 text-sm text-gray-600">{collection.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {collection.assetCount} assets • Created by {collection.createdByName} on{' '}
            {new Date(collection.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="subtle" size="sm">
            Edit
          </Button>
          <Button variant="subtle" size="sm">
            Add Assets
          </Button>
        </div>
      </div>

      {/* Assets grid */}
      {validAssets.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600">No assets in this collection.</p>
          <Button variant="bold" className="mt-4">
            Add Assets
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="font-medium text-gray-900 hover:text-platform-primary"
                  >
                    {asset.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">{asset.contributorName}</p>
                  <div className="mt-2">
                    <AssetTypeBadge type={asset.type} />
                  </div>
                </div>
                <button
                  className="text-sm text-red-600 hover:text-red-800 ml-2"
                  onClick={async () => {
                    // Remove from collection - this would need client component
                    console.log('Remove asset', asset.id)
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
