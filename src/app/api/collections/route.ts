import { NextRequest, NextResponse } from 'next/server'
import type { Collection, CollectionListItem } from '@/types/collection'
import type { PaginatedResponse } from '@/types/api'
import type { Platform } from '@/types/platform'

// Mock collections data generator
function generateMockCollections(count: number): Collection[] {
  const collections: Collection[] = []

  const titles = [
    'Summer Vibes 2026',
    'Piano Instrumentals',
    'Epic Cinematic',
    'Uplifting Pop',
    'Dark Electronic',
    'Acoustic Guitar Collection',
    'Corporate Background',
    'Trailer Music',
    'Ambient Soundscapes',
    'Retro Synthwave',
    'Hip Hop Beats',
    'Orchestral Drama',
    'Chill Lofi',
    'Energetic Workout',
    'Romantic Strings',
    'Action & Adventure',
    'Documentary Scoring',
    'Jazz Standards',
    'World Music',
    'Children\'s Music',
    'Holiday Specials',
    'Nature Sounds',
    'Tech & Innovation',
    'Travel & Discovery',
    'Food & Lifestyle',
    'Gaming OST',
    'Emotional Piano',
    'Rock Anthems',
    'Minimal & Sparse',
    'Dance & EDM',
  ]

  const platforms: (Platform | 'both')[] = ['music-vine', 'uppbeat', 'both']

  for (let i = 0; i < count; i++) {
    const id = `collection-${i + 1}`
    const title = titles[i % titles.length]
    const platform = platforms[i % platforms.length]
    const assetCount = 5 + (i * 7 % 50) // Vary between 5-55 assets

    collections.push({
      id,
      title: count > titles.length ? `${title} ${Math.floor(i / titles.length) + 1}` : title,
      description: `Curated collection of ${assetCount} assets for ${title.toLowerCase()}`,
      platform,
      assetIds: Array.from({ length: assetCount }, (_, j) => `asset-${i * 50 + j + 1}`),
      assetCount,
      createdBy: 'user-1',
      createdByName: 'Admin User',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(), // Stagger creation dates
      updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
    })
  }

  return collections
}

// Generate 30 mock collections
const mockCollections = generateMockCollections(30)

export async function GET(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get('platform') as Platform | 'both' | null
  const query = searchParams.get('query')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  // Filter collections
  let filtered = [...mockCollections]

  if (platform) {
    filtered = filtered.filter(c => c.platform === platform || c.platform === 'both' || platform === 'both')
  }

  if (query) {
    const lowerQuery = query.toLowerCase()
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
    )
  }

  // Paginate
  const total = filtered.length
  const start = (page - 1) * limit
  const end = start + limit
  const data = filtered.slice(start, end)

  // Convert to list items
  const listItems: CollectionListItem[] = data.map(c => ({
    id: c.id,
    title: c.title,
    platform: c.platform,
    assetCount: c.assetCount,
    createdAt: c.createdAt,
  }))

  const response: PaginatedResponse<CollectionListItem> = {
    data: listItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }

  return NextResponse.json(response)
}

export async function POST(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    const body = await request.json()
    const { title, description, platform, assetIds = [] } = body

    // Validate required fields
    if (!title || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: title, platform' },
        { status: 400 }
      )
    }

    // Create new collection
    const newCollection: Collection = {
      id: `collection-${Date.now()}`,
      title,
      description,
      platform,
      assetIds,
      assetCount: assetIds.length,
      createdBy: 'user-1', // Mock user
      createdByName: 'Admin User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to mock data
    mockCollections.unshift(newCollection)

    return NextResponse.json(newCollection, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
