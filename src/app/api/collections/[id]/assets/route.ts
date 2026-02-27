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

// POST /api/collections/[id]/assets - Add assets to collection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const result = await proxyToBackend(request, `/admin/collections/${id}/assets`, { method: 'POST', body })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 80))

  const { assetIds } = body as { assetIds: string[] }

  if (!Array.isArray(assetIds) || assetIds.length === 0) {
    return NextResponse.json(
      { error: 'assetIds must be a non-empty array' },
      { status: 400 }
    )
  }

  const collection = generateMockCollection(id)

  if (!collection) {
    return NextResponse.json(
      { error: 'Collection not found' },
      { status: 404 }
    )
  }

  // Add assets (append to existing, avoid duplicates)
  const updatedAssetIds = [...new Set([...collection.assetIds, ...assetIds])]

  const updatedCollection: Collection = {
    ...collection,
    assetIds: updatedAssetIds,
    assetCount: updatedAssetIds.length,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updatedCollection)
}
