import { NextRequest, NextResponse } from 'next/server'
import type { License, PaginatedResponse, LicenseType } from '@/types'

/**
 * Generate mock licenses for a user.
 */
function generateMockLicenses(userId: string): License[] {
  const licenses: License[] = []

  // Extract number from ID for consistent data generation
  const idNum = parseInt(userId.replace('user-', ''), 10) || 1

  const assetNames = [
    'Premium Track Collection',
    'Pro Sound Effects Pack',
    'Motion Graphics Bundle',
    'LUT Color Grading Set',
    'Stock Footage Library',
    'Corporate Music Suite',
    'Cinematic SFX Pack',
    'Wedding Music Collection',
    'Documentary Audio Kit',
    'Social Media Music',
    'Podcast Intro Pack',
    'Gaming Sound Library',
    'Nature Sounds Premium',
    'Urban Ambience Collection',
    'Retro Music Pack',
    'Modern Pop Beats',
    'Classical Music Suite',
    'Jazz Standards Collection',
    'Electronic Music Pack',
    'Acoustic Guitar Library',
  ]

  const licenseTypes: LicenseType[] = ['standard', 'premium', 'enterprise']

  // Generate 20 licenses
  for (let i = 0; i < 20; i++) {
    const seed = idNum * 50 + i
    const assetName = assetNames[seed % assetNames.length]
    const licenseType = licenseTypes[seed % licenseTypes.length]

    // Random grant date within last 180 days
    const now = Date.now()
    const halfYearAgo = now - 180 * 24 * 60 * 60 * 1000
    const grantedAt = new Date(
      halfYearAgo + (seed * 234567) % (now - halfYearAgo)
    ).toISOString()

    // 50% perpetual (null expiry), 50% with expiry date
    let expiresAt: string | null = null
    if (seed % 2 === 0) {
      // Expiry date 1-2 years from grant date
      const grantTimestamp = new Date(grantedAt).getTime()
      const oneYear = 365 * 24 * 60 * 60 * 1000
      const twoYears = 2 * oneYear
      expiresAt = new Date(
        grantTimestamp + oneYear + (seed * 345678) % oneYear
      ).toISOString()
    }

    licenses.push({
      id: `license-${userId}-${i}`,
      assetId: `asset-${seed}`,
      assetName: `${assetName} ${seed % 50}`,
      licenseType,
      grantedAt,
      expiresAt,
    })
  }

  // Sort by grantedAt (newest first)
  licenses.sort(
    (a, b) =>
      new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime()
  )

  return licenses
}

/**
 * GET /api/users/[id]/licenses - Get user's licenses with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100))

  const { id: userId } = await params
  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

  // Generate all licenses
  const allLicenses = generateMockLicenses(userId)

  // Calculate pagination
  const totalItems = allLicenses.length
  const totalPages = Math.ceil(totalItems / limit)
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedLicenses = allLicenses.slice(start, end)

  const response: PaginatedResponse<License> = {
    data: paginatedLicenses,
    pagination: {
      page,
      pageSize: paginatedLicenses.length,
      totalPages,
      totalItems,
    },
  }

  return NextResponse.json(response)
}
