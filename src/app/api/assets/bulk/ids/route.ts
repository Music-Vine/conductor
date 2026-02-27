import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'
import type { AssetType, MusicWorkflowState, SimpleWorkflowState, Platform } from '@/types'

/**
 * Seeded random number generator for consistent ID generation
 */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

/**
 * Generate consistent asset IDs based on filter params
 */
function generateAssetIds(
  type?: AssetType | null,
  status?: MusicWorkflowState | SimpleWorkflowState | null,
  platform?: Platform | 'both' | null,
  genre?: string | null
): string[] {
  // Create a consistent seed from filter params
  const filterKey = [type || 'all', status || 'all', platform || 'all', genre || 'all'].join('-')
  const seed = filterKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = seededRandom(seed)

  // Generate a consistent count based on filters (50-500 items)
  const baseCount = Math.floor(random() * 450) + 50
  const ids: string[] = []

  for (let i = 0; i < baseCount; i++) {
    // Generate consistent IDs
    const idNum = Math.floor(random() * 100000)
    ids.push(`asset-${idNum.toString().padStart(6, '0')}`)
  }

  return ids
}

/**
 * GET /api/assets/bulk/ids - Get all asset IDs matching current filters for Select All.
 * Conditionally proxies to real backend when NEXT_PUBLIC_USE_REAL_API=true.
 */
export async function GET(request: NextRequest) {
  const result = await proxyToBackend(request, '/admin/assets/bulk/ids')
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') as AssetType | null
  const status = searchParams.get('status') as MusicWorkflowState | SimpleWorkflowState | null
  const platform = searchParams.get('platform') as Platform | 'both' | null
  const genre = searchParams.get('genre')?.toLowerCase() || null

  // Generate consistent IDs based on filters
  const ids = generateAssetIds(type, status, platform, genre)

  return NextResponse.json({
    ids,
    total: ids.length,
  })
}
