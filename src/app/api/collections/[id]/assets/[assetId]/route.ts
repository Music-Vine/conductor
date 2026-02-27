import { NextRequest, NextResponse } from 'next/server'
import type { Collection } from '@/types/collection'
import { proxyToBackend } from '@/lib/api/proxy'

// Generate mock collection for testing
function generateMockCollection(id: string): Collection | null {
  const collectionIndex = parseInt(id.replace('collection-', ''))

  if (isNaN(collectionIndex)) {
    return null
  }

  const titles = [
    'Summer Vibes 2026',
    'Piano Instrumentals',
    'Epic Cinematic',
    'Uplifting Pop',
    'Dark Electronic',
  ]

  const platforms: ('music-vine' | 'uppbeat' | 'both')[] = ['music-vine', 'uppbeat', 'both']
  const i = collectionIndex - 1
  const title = titles[i % titles.length]
  const platform = platforms[i % platforms.length]
  const assetCount = 5 + (i * 7 % 50)

  return {
    id,
    title: `${title} ${Math.floor(i / titles.length) + 1}`,
    description: `Curated collection of ${assetCount} assets for ${title.toLowerCase()}`,
    platform,
    assetIds: Array.from({ length: assetCount }, (_, j) => `asset-${i * 50 + j + 1}`),
    assetCount,
    createdBy: 'user-1',
    createdByName: 'Admin User',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
  }
}

// DELETE /api/collections/[id]/assets/[assetId] - Remove asset from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id, assetId } = await params

  const result = await proxyToBackend(request, `/admin/collections/${id}/assets/${assetId}`, {
    method: 'DELETE',
  })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 80))

  const collection = generateMockCollection(id)

  if (!collection) {
    return NextResponse.json(
      { error: 'Collection not found' },
      { status: 404 }
    )
  }

  // Remove asset
  const updatedAssetIds = collection.assetIds.filter(aid => aid !== assetId)

  // Check if asset was in collection
  if (updatedAssetIds.length === collection.assetIds.length) {
    return NextResponse.json(
      { error: 'Asset not found in collection' },
      { status: 404 }
    )
  }

  const updatedCollection: Collection = {
    ...collection,
    assetIds: updatedAssetIds,
    assetCount: updatedAssetIds.length,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updatedCollection)
}
