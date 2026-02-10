'use client'

import type { Asset } from '@/types/asset'
import { isMusicAsset } from '@/types/asset'
import { AssetPreview } from '@/components/asset'

interface OverviewTabProps {
  asset: Asset
}

export function OverviewTab({ asset }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Preview section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
          <AssetPreview asset={asset} />
        </div>
      </div>

      {/* Metadata section */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>
          <dl className="space-y-3">
            <MetadataRow label="Title" value={asset.title} />
            {asset.description && <MetadataRow label="Description" value={asset.description} />}
            <MetadataRow label="Contributor" value={asset.contributorName} />
            {asset.type === 'music' && isMusicAsset(asset) && asset.genre && (
              <MetadataRow label="Genre" value={asset.genre} />
            )}

            {/* Type-specific fields */}
            {isMusicAsset(asset) && (
              <>
                {asset.bpm && <MetadataRow label="BPM" value={String(asset.bpm)} />}
                {asset.key && <MetadataRow label="Key" value={asset.key} />}
                <MetadataRow label="Duration" value={formatDuration(asset.duration)} />
              </>
            )}

            {asset.type === 'sfx' && (
              <>
                <MetadataRow label="Category" value={(asset as any).category} />
                <MetadataRow label="Duration" value={formatDuration((asset as any).duration)} />
              </>
            )}

            {(asset.type === 'motion-graphics' || asset.type === 'stock-footage') && (
              <>
                <MetadataRow label="Resolution" value={(asset as any).resolution} />
                <MetadataRow label="Duration" value={formatDuration((asset as any).duration)} />
              </>
            )}

            {asset.type === 'lut' && (
              <>
                <MetadataRow label="Format" value={(asset as any).format} />
              </>
            )}
          </dl>
        </div>

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {asset.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              Edit Metadata
            </button>
            {asset.status === 'published' && (
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                Unpublish Asset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
