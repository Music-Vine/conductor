import { NextRequest, NextResponse } from 'next/server'
import type { Collection } from '@/types/collection'
import type { Platform } from '@/types/platform'
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

  const platforms: (Platform | 'both')[] = ['music-vine', 'uppbeat', 'both']
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const result = await proxyToBackend(request, `/admin/collections/${id}`)
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

  return NextResponse.json(collection)
}

export async function PATCH(
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

  const result = await proxyToBackend(request, `/admin/collections/${id}`, { method: 'PATCH', body })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 80))

  const { title, description, platform } = body as {
    title?: string
    description?: string
    platform?: Collection['platform']
  }

  const collection = generateMockCollection(id)

  if (!collection) {
    return NextResponse.json(
      { error: 'Collection not found' },
      { status: 404 }
    )
  }

  // Update collection fields
  const updatedCollection: Collection = {
    ...collection,
    title: title ?? collection.title,
    description: description !== undefined ? description : collection.description,
    platform: platform ?? collection.platform,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updatedCollection)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const result = await proxyToBackend(request, `/admin/collections/${id}`, { method: 'DELETE' })
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

  return NextResponse.json({ success: true })
}
