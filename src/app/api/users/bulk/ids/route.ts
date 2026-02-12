import { NextRequest, NextResponse } from 'next/server'
import type { UserStatus, SubscriptionTier } from '@/types'

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
 * Generate consistent user IDs based on filter params
 */
function generateUserIds(
  query?: string | null,
  status?: UserStatus | null,
  tier?: SubscriptionTier | null
): string[] {
  // Create a consistent seed from filter params
  const filterKey = [query || 'all', status || 'all', tier || 'all'].join('-')
  const seed = filterKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = seededRandom(seed)

  // Generate a consistent count based on filters (20-300 items)
  const baseCount = Math.floor(random() * 280) + 20
  const ids: string[] = []

  for (let i = 0; i < baseCount; i++) {
    // Generate consistent IDs
    const idNum = Math.floor(random() * 100000)
    ids.push(`user-${idNum.toString().padStart(6, '0')}`)
  }

  return ids
}

/**
 * GET /api/users/bulk/ids - Get all user IDs matching current filters for Select All
 */
export async function GET(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')?.toLowerCase() || null
  const status = searchParams.get('status') as UserStatus | null
  const tier = searchParams.get('tier') as SubscriptionTier | null

  // Generate consistent IDs based on filters
  const ids = generateUserIds(query, status, tier)

  return NextResponse.json({
    ids,
    total: ids.length,
  })
}
