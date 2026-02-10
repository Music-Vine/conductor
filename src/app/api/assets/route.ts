import { NextRequest, NextResponse } from 'next/server'
import type {
  PaginatedResponse,
  AssetListItem,
  AssetType,
  MusicWorkflowState,
  SimpleWorkflowState,
  Platform,
} from '@/types'

/**
 * Generate realistic asset data.
 */
function generateMockAssets(): AssetListItem[] {
  const assets: AssetListItem[] = []

  // Music titles
  const musicTitles = [
    'Summer Vibes', 'Corporate Motivation', 'Epic Cinematic', 'Acoustic Dreams',
    'Electronic Pulse', 'Hip Hop Beat', 'Piano Reflections', 'Rock Anthem',
    'Jazz Cafe', 'Orchestral Journey', 'Ambient Space', 'Folk Tales',
    'Uplifting Pop', 'Dark Atmosphere', 'Tropical House', 'Retro Synthwave',
    'Indie Rock', 'Classical Beauty', 'Modern Trap', 'Country Road',
  ]

  // SFX categories
  const sfxCategories = ['UI Sounds', 'Nature', 'Impacts', 'Transitions', 'Ambience']
  const sfxTitles = [
    'Button Click', 'Bird Chirping', 'Glass Break', 'Whoosh', 'City Traffic',
    'Water Drip', 'Door Slam', 'Wind Howl', 'Crowd Murmur', 'Explosion',
  ]

  // Motion graphics titles
  const motionTitles = [
    'Lower Third', 'Logo Reveal', 'Text Animation', 'Transition Pack',
    'Social Media Opener', 'Subscribe Button', 'Particle Effect', 'Glitch Effect',
  ]

  // LUT titles
  const lutTitles = [
    'Cinematic Teal Orange', 'Vintage Film', 'High Contrast', 'Warm Glow',
    'Cool Blue', 'Black and White', 'Sunset Magic', 'Urban Grunge',
  ]

  // Stock footage titles
  const footageTitles = [
    'City Skyline', 'Ocean Waves', 'Forest Path', 'Coffee Shop',
    'Time Lapse Clouds', 'Night Traffic', 'Mountain Peak', 'Beach Sunset',
  ]

  // Contributor names
  const contributors = [
    'Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson',
    'David Martinez', 'Rachel Kim', 'James Brown', 'Lisa Anderson',
    'Chris Taylor', 'Maria Garcia', 'Kevin White', 'Jennifer Lee',
    'Tom Harris', 'Sophie Clark', 'Daniel Moore', 'Olivia Davis',
  ]

  // Music genres
  const musicGenres = [
    'Pop', 'Rock', 'Electronic', 'Hip Hop', 'Jazz', 'Classical',
    'Folk', 'Ambient', 'Cinematic', 'Corporate',
  ]

  // Workflow states weighted distribution
  const musicStates: MusicWorkflowState[] = ['draft', 'submitted', 'initial_review', 'quality_check', 'platform_assignment', 'final_approval', 'published', 'rejected_initial', 'rejected_quality', 'rejected_final']
  const simpleStates: SimpleWorkflowState[] = ['draft', 'submitted', 'review', 'published', 'rejected']

  const now = Date.now()
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)

  let assetId = 1

  // Generate 300 music assets
  for (let i = 0; i < 300; i++) {
    const contributor = contributors[i % contributors.length]
    const title = `${musicTitles[i % musicTitles.length]} ${Math.floor(i / musicTitles.length) + 1}`
    const genre = musicGenres[i % musicGenres.length]

    // Status distribution: 40% published, 20% submitted, 20% in-review stages, 10% draft, 10% rejected
    let status: MusicWorkflowState
    const rand = Math.random()
    if (rand < 0.4) status = 'published'
    else if (rand < 0.6) status = 'submitted'
    else if (rand < 0.7) status = 'initial_review'
    else if (rand < 0.8) status = 'quality_check'
    else if (rand < 0.85) status = 'draft'
    else if (rand < 0.9) status = 'platform_assignment'
    else if (rand < 0.95) status = 'final_approval'
    else status = i % 3 === 0 ? 'rejected_initial' : i % 3 === 1 ? 'rejected_quality' : 'rejected_final'

    // Platform: default 'both', but some are exclusive
    let platform: Platform | 'both'
    const platformRand = Math.random()
    if (platformRand < 0.6) platform = 'both'
    else if (platformRand < 0.8) platform = 'music-vine'
    else platform = 'uppbeat'

    const createdAt = new Date(oneYearAgo + Math.random() * (now - oneYearAgo)).toISOString()
    const duration = 120 + Math.floor(Math.random() * 180) // 2-5 minutes

    assets.push({
      id: `asset-${assetId++}`,
      title,
      type: 'music',
      contributorName: contributor,
      platform,
      status,
      genre,
      duration,
      createdAt,
      updatedAt: createdAt,
    })
  }

  // Generate 80 SFX assets
  for (let i = 0; i < 80; i++) {
    const contributor = contributors[i % contributors.length]
    const title = `${sfxTitles[i % sfxTitles.length]} ${Math.floor(i / sfxTitles.length) + 1}`
    const category = sfxCategories[i % sfxCategories.length]

    let status: SimpleWorkflowState
    const rand = Math.random()
    if (rand < 0.4) status = 'published'
    else if (rand < 0.6) status = 'submitted'
    else if (rand < 0.8) status = 'review'
    else if (rand < 0.9) status = 'draft'
    else status = 'rejected'

    const createdAt = new Date(oneYearAgo + Math.random() * (now - oneYearAgo)).toISOString()
    const duration = 1 + Math.floor(Math.random() * 10) // 1-10 seconds

    assets.push({
      id: `asset-${assetId++}`,
      title,
      type: 'sfx',
      contributorName: contributor,
      platform: 'uppbeat',
      status,
      genre: category,
      duration,
      createdAt,
      updatedAt: createdAt,
    })
  }

  // Generate 50 motion graphics assets
  for (let i = 0; i < 50; i++) {
    const contributor = contributors[i % contributors.length]
    const title = `${motionTitles[i % motionTitles.length]} ${Math.floor(i / motionTitles.length) + 1}`

    let status: SimpleWorkflowState
    const rand = Math.random()
    if (rand < 0.4) status = 'published'
    else if (rand < 0.6) status = 'submitted'
    else if (rand < 0.8) status = 'review'
    else if (rand < 0.9) status = 'draft'
    else status = 'rejected'

    const createdAt = new Date(oneYearAgo + Math.random() * (now - oneYearAgo)).toISOString()
    const duration = 5 + Math.floor(Math.random() * 25) // 5-30 seconds

    assets.push({
      id: `asset-${assetId++}`,
      title,
      type: 'motion-graphics',
      contributorName: contributor,
      platform: 'uppbeat',
      status,
      duration,
      createdAt,
      updatedAt: createdAt,
    })
  }

  // Generate 30 LUT assets
  for (let i = 0; i < 30; i++) {
    const contributor = contributors[i % contributors.length]
    const title = `${lutTitles[i % lutTitles.length]} ${Math.floor(i / lutTitles.length) + 1}`

    let status: SimpleWorkflowState
    const rand = Math.random()
    if (rand < 0.4) status = 'published'
    else if (rand < 0.6) status = 'submitted'
    else if (rand < 0.8) status = 'review'
    else if (rand < 0.9) status = 'draft'
    else status = 'rejected'

    const createdAt = new Date(oneYearAgo + Math.random() * (now - oneYearAgo)).toISOString()

    assets.push({
      id: `asset-${assetId++}`,
      title,
      type: 'lut',
      contributorName: contributor,
      platform: 'uppbeat',
      status,
      createdAt,
      updatedAt: createdAt,
    })
  }

  // Generate 40 stock footage assets
  for (let i = 0; i < 40; i++) {
    const contributor = contributors[i % contributors.length]
    const title = `${footageTitles[i % footageTitles.length]} ${Math.floor(i / footageTitles.length) + 1}`

    let status: SimpleWorkflowState
    const rand = Math.random()
    if (rand < 0.4) status = 'published'
    else if (rand < 0.6) status = 'submitted'
    else if (rand < 0.8) status = 'review'
    else if (rand < 0.9) status = 'draft'
    else status = 'rejected'

    const createdAt = new Date(oneYearAgo + Math.random() * (now - oneYearAgo)).toISOString()
    const duration = 10 + Math.floor(Math.random() * 50) // 10-60 seconds

    assets.push({
      id: `asset-${assetId++}`,
      title,
      type: 'stock-footage',
      contributorName: contributor,
      platform: 'uppbeat',
      status,
      duration,
      createdAt,
      updatedAt: createdAt,
    })
  }

  return assets
}

/**
 * GET /api/assets - List assets with filtering and pagination
 */
export async function GET(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')?.toLowerCase()
  const type = searchParams.get('type') as AssetType | null
  const status = searchParams.get('status') as MusicWorkflowState | SimpleWorkflowState | null
  const platform = searchParams.get('platform') as Platform | 'both' | null
  const genre = searchParams.get('genre')?.toLowerCase()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  // Generate mock assets
  let assets = generateMockAssets()

  // Apply filters
  if (query) {
    assets = assets.filter(asset =>
      asset.title.toLowerCase().includes(query) ||
      asset.contributorName.toLowerCase().includes(query) ||
      asset.id.toLowerCase().includes(query)
    )
  }

  if (type) {
    assets = assets.filter(asset => asset.type === type)
  }

  if (status) {
    assets = assets.filter(asset => asset.status === status)
  }

  if (platform) {
    assets = assets.filter(asset =>
      asset.platform === platform ||
      (platform !== 'both' && asset.platform === 'both')
    )
  }

  if (genre) {
    assets = assets.filter(asset =>
      asset.genre?.toLowerCase().includes(genre)
    )
  }

  // Calculate pagination
  const totalItems = assets.length
  const totalPages = Math.ceil(totalItems / limit)
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedAssets = assets.slice(start, end)

  const response: PaginatedResponse<AssetListItem> = {
    data: paginatedAssets,
    pagination: {
      page,
      pageSize: paginatedAssets.length,
      totalPages,
      totalItems,
    },
  }

  return NextResponse.json(response)
}

/**
 * POST /api/assets - Create new asset
 */
export async function POST(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  try {
    const body = await request.json()

    // Basic validation
    if (!body.type || !body.title || !body.contributorId || !body.fileKey) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, contributorId, fileKey' },
        { status: 400 }
      )
    }

    // Create mock asset
    const now = new Date().toISOString()
    const newAsset: AssetListItem = {
      id: `asset-${Date.now()}`,
      title: body.title,
      type: body.type,
      contributorName: body.contributorName || 'Unknown Contributor',
      platform: body.type === 'music' ? (body.platform || 'both') : 'uppbeat',
      status: 'draft',
      genre: body.genre,
      duration: body.duration,
      createdAt: now,
      updatedAt: now,
    }

    return NextResponse.json({ data: newAsset }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
