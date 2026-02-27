import { NextRequest, NextResponse } from 'next/server'
import type { Download, PaginatedResponse, DownloadAssetType } from '@/types'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * Generate mock downloads for a user.
 */
function generateMockDownloads(userId: string): Download[] {
  const downloads: Download[] = []

  // Extract number from ID for consistent data generation
  const idNum = parseInt(userId.replace('user-', ''), 10) || 1

  const assetNames = [
    'Upbeat Corporate',
    'Dramatic Reveal',
    'Chill Vibes',
    'Epic Cinematic',
    'Smooth Jazz',
    'Energetic Rock',
    'Ambient Meditation',
    'Happy Acoustic',
    'Dark Suspense',
    'Cheerful Pop',
    'Inspiring Piano',
    'Gentle Guitar',
    'Electronic Dance',
    'Classical Symphony',
    'Funky Groove',
    'Soft Background',
    'Action Trailer',
    'Romantic Ballad',
    'Tech Startup',
    'Nature Sounds',
  ]

  const assetTypes: DownloadAssetType[] = ['music', 'sfx', 'motion', 'lut', 'footage']
  const formats = ['wav', 'mp3', 'aiff', 'flac']

  // Generate 50 downloads
  for (let i = 0; i < 50; i++) {
    const seed = idNum * 100 + i
    const assetName = assetNames[seed % assetNames.length]
    const assetType = assetTypes[seed % assetTypes.length]
    const format = formats[seed % formats.length]

    // Random date within last 90 days
    const now = Date.now()
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000
    const downloadedAt = new Date(
      ninetyDaysAgo + (seed * 123456) % (now - ninetyDaysAgo)
    ).toISOString()

    downloads.push({
      id: `download-${userId}-${i}`,
      assetId: `asset-${seed}`,
      assetName: `${assetName} ${seed % 100}`,
      assetType,
      downloadedAt,
      format,
    })
  }

  // Sort by downloadedAt (newest first)
  downloads.sort(
    (a, b) =>
      new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
  )

  return downloads
}

/**
 * GET /api/users/[id]/downloads - Get user's downloads with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params

  const result = await proxyToBackend(request, `/admin/users/${userId}/downloads`)
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100))

  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

  // Generate all downloads
  const allDownloads = generateMockDownloads(userId)

  // Calculate pagination
  const totalItems = allDownloads.length
  const totalPages = Math.ceil(totalItems / limit)
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedDownloads = allDownloads.slice(start, end)

  const response: PaginatedResponse<Download> = {
    data: paginatedDownloads,
    pagination: {
      page,
      pageSize: paginatedDownloads.length,
      totalPages,
      totalItems,
    },
  }

  return NextResponse.json(response)
}
