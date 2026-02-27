import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

type AssetType = 'music' | 'sfx' | 'motion-graphics' | 'lut' | 'stock-footage'
type AssetStatus = 'draft' | 'initial_review' | 'quality_check' | 'platform_assignment' | 'final_approval' | 'approved' | 'rejected' | 'published'

interface ContributorAssetListItem {
  id: string
  title: string
  type: AssetType
  status: AssetStatus
  createdAt: string
}

const ASSET_TITLES = [
  'Summer Breeze', 'Urban Nights', 'Mountain Echo', 'Ocean Waves', 'City Lights',
  'Forest Dreams', 'Desert Wind', 'Arctic Pulse', 'Tropical Storm', 'Jazz Lounge',
  'Electronic Rush', 'Acoustic Morning', 'Classical Suite', 'Hip Hop Beat', 'Ambient Space',
  'Rock Anthem', 'Blues Journey', 'Cinematic Score', 'Corporate Theme', 'Upbeat Promo',
]

const ASSET_TYPES: AssetType[] = ['music', 'sfx', 'motion-graphics', 'lut', 'stock-footage']
const ASSET_STATUSES: AssetStatus[] = ['draft', 'initial_review', 'quality_check', 'approved', 'published']

/**
 * Generate mock assets for a contributor using the contributor ID as seed.
 */
function generateContributorAssets(idNum: number): ContributorAssetListItem[] {
  // Generate 5-15 assets based on id seed
  const count = 5 + (idNum % 11)
  const assets: ContributorAssetListItem[] = []

  const BASE_EPOCH = 1700000000000
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

  for (let i = 0; i < count; i++) {
    const seed = idNum * 13 + i * 7
    const titleIndex = (seed * 3) % ASSET_TITLES.length
    const typeIndex = seed % ASSET_TYPES.length
    const statusIndex = (seed * 2) % ASSET_STATUSES.length

    const createdAt = new Date(BASE_EPOCH - ONE_YEAR_MS + (seed * 5 * 24 * 60 * 60 * 1000 % ONE_YEAR_MS)).toISOString()

    assets.push({
      id: `asset-contrib-${String(idNum).padStart(3, '0')}-${String(i + 1).padStart(3, '0')}`,
      title: `${ASSET_TITLES[titleIndex]} ${i + 1}`,
      type: ASSET_TYPES[typeIndex],
      status: ASSET_STATUSES[statusIndex],
      createdAt,
    })
  }

  return assets
}

/**
 * GET /api/contributors/[id]/assets - Get assets associated with a contributor.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const result = await proxyToBackend(request, `/admin/contributors/${id}/assets`)
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  const idNum = parseInt(id.replace('contrib-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 20) {
    return NextResponse.json(
      { error: 'Contributor not found' },
      { status: 404 }
    )
  }

  const assets = generateContributorAssets(idNum)

  return NextResponse.json({ data: assets })
}
