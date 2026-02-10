import { NextRequest, NextResponse } from 'next/server'
import type {
  Asset,
  MusicAsset,
  SfxAsset,
  MotionGraphicsAsset,
  LutAsset,
  StockFootageAsset,
  MusicWorkflowState,
  SimpleWorkflowState,
} from '@/types'

/**
 * Generate a full mock asset based on ID.
 */
function generateMockAsset(id: string): Asset | null {
  // Parse asset ID to determine type and properties
  const match = id.match(/^asset-(\d+)$/)
  if (!match) return null

  const assetNum = parseInt(match[1], 10)

  // Determine asset type based on ID range
  let type: Asset['type']
  if (assetNum <= 300) type = 'music'
  else if (assetNum <= 380) type = 'sfx'
  else if (assetNum <= 430) type = 'motion-graphics'
  else if (assetNum <= 460) type = 'lut'
  else if (assetNum <= 500) type = 'stock-footage'
  else return null

  const now = Date.now()
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
  const createdAt = new Date(oneYearAgo + (assetNum * 60 * 60 * 1000)).toISOString()

  const contributors = ['Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson']
  const contributor = contributors[assetNum % contributors.length]

  // Common fields
  const baseAsset = {
    id,
    contributorId: `contributor-${(assetNum % 16) + 1}`,
    contributorName: contributor,
    fileKey: `uploads/${id}/original.mp3`,
    fileUrl: `https://mock-s3.example.com/uploads/${id}/original.mp3`,
    fileSize: 5000000 + assetNum * 10000,
    tags: ['professional', 'royalty-free'],
    createdAt,
    updatedAt: createdAt,
  }

  // Generate type-specific asset
  if (type === 'music') {
    const genres = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Jazz', 'Classical', 'Folk', 'Ambient', 'Cinematic', 'Corporate']
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const instruments = ['Piano', 'Guitar', 'Drums', 'Bass', 'Synth', 'Strings', 'Vocals']

    let status: MusicWorkflowState
    const rand = (assetNum * 7) % 100
    if (rand < 40) status = 'published'
    else if (rand < 60) status = 'submitted'
    else if (rand < 70) status = 'initial_review'
    else if (rand < 80) status = 'quality_check'
    else if (rand < 85) status = 'draft'
    else if (rand < 90) status = 'platform_assignment'
    else if (rand < 95) status = 'final_approval'
    else status = assetNum % 3 === 0 ? 'rejected_initial' : assetNum % 3 === 1 ? 'rejected_quality' : 'rejected_final'

    const platformRand = (assetNum * 13) % 100
    const platform = platformRand < 60 ? 'both' : platformRand < 80 ? 'music-vine' : 'uppbeat'

    const asset: MusicAsset = {
      ...baseAsset,
      type: 'music',
      title: `Music Track ${assetNum}`,
      description: `A ${genres[assetNum % genres.length].toLowerCase()} track with professional production quality.`,
      platform,
      status,
      genre: genres[assetNum % genres.length],
      bpm: 80 + (assetNum % 80),
      key: keys[assetNum % keys.length],
      duration: 120 + (assetNum % 180),
      instruments: [
        instruments[assetNum % instruments.length],
        instruments[(assetNum + 1) % instruments.length],
      ],
      tags: ['professional', 'royalty-free', genres[assetNum % genres.length].toLowerCase()],
    }

    if (status === 'published') {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
      asset.approvedAt = new Date(new Date(createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString()
      asset.publishedAt = new Date(new Date(createdAt).getTime() + 96 * 60 * 60 * 1000).toISOString()
    } else if (['submitted', 'initial_review', 'quality_check', 'platform_assignment', 'final_approval'].includes(status)) {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
    }

    return asset
  } else if (type === 'sfx') {
    const categories = ['UI Sounds', 'Nature', 'Impacts', 'Transitions', 'Ambience']
    let status: SimpleWorkflowState
    const rand = (assetNum * 7) % 100
    if (rand < 40) status = 'published'
    else if (rand < 60) status = 'submitted'
    else if (rand < 80) status = 'review'
    else if (rand < 90) status = 'draft'
    else status = 'rejected'

    const asset: SfxAsset = {
      ...baseAsset,
      type: 'sfx',
      title: `SFX ${assetNum - 300}`,
      description: 'High-quality sound effect for professional video production.',
      platform: 'uppbeat',
      status,
      category: categories[(assetNum - 300) % categories.length],
      duration: 1 + ((assetNum - 300) % 10),
      tags: ['sfx', 'professional', categories[(assetNum - 300) % categories.length].toLowerCase()],
    }

    if (status === 'published') {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
      asset.approvedAt = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString()
      asset.publishedAt = new Date(new Date(createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString()
    } else if (['submitted', 'review'].includes(status)) {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
    }

    return asset
  } else if (type === 'motion-graphics') {
    let status: SimpleWorkflowState
    const rand = (assetNum * 7) % 100
    if (rand < 40) status = 'published'
    else if (rand < 60) status = 'submitted'
    else if (rand < 80) status = 'review'
    else if (rand < 90) status = 'draft'
    else status = 'rejected'

    const asset: MotionGraphicsAsset = {
      ...baseAsset,
      type: 'motion-graphics',
      title: `Motion Graphics ${assetNum - 380}`,
      description: 'Professional motion graphics template for video editing.',
      platform: 'uppbeat',
      status,
      resolution: assetNum % 2 === 0 ? '1920x1080' : '3840x2160',
      duration: 5 + ((assetNum - 380) % 25),
      format: 'MOV',
      tags: ['motion-graphics', 'template', 'professional'],
      fileKey: `uploads/${id}/original.mov`,
      fileUrl: `https://mock-s3.example.com/uploads/${id}/original.mov`,
    }

    if (status === 'published') {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
      asset.approvedAt = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString()
      asset.publishedAt = new Date(new Date(createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString()
    } else if (['submitted', 'review'].includes(status)) {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
    }

    return asset
  } else if (type === 'lut') {
    let status: SimpleWorkflowState
    const rand = (assetNum * 7) % 100
    if (rand < 40) status = 'published'
    else if (rand < 60) status = 'submitted'
    else if (rand < 80) status = 'review'
    else if (rand < 90) status = 'draft'
    else status = 'rejected'

    const asset: LutAsset = {
      ...baseAsset,
      type: 'lut',
      title: `LUT ${assetNum - 430}`,
      description: 'Professional color grading LUT for cinematic looks.',
      platform: 'uppbeat',
      status,
      format: '.cube',
      compatibleSoftware: ['Adobe Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro'],
      tags: ['lut', 'color-grading', 'cinematic'],
      fileKey: `uploads/${id}/original.cube`,
      fileUrl: `https://mock-s3.example.com/uploads/${id}/original.cube`,
    }

    if (status === 'published') {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
      asset.approvedAt = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString()
      asset.publishedAt = new Date(new Date(createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString()
    } else if (['submitted', 'review'].includes(status)) {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
    }

    return asset
  } else if (type === 'stock-footage') {
    let status: SimpleWorkflowState
    const rand = (assetNum * 7) % 100
    if (rand < 40) status = 'published'
    else if (rand < 60) status = 'submitted'
    else if (rand < 80) status = 'review'
    else if (rand < 90) status = 'draft'
    else status = 'rejected'

    const asset: StockFootageAsset = {
      ...baseAsset,
      type: 'stock-footage',
      title: `Stock Footage ${assetNum - 460}`,
      description: 'High-quality stock footage for professional video production.',
      platform: 'uppbeat',
      status,
      resolution: assetNum % 2 === 0 ? '1920x1080' : '3840x2160',
      duration: 10 + ((assetNum - 460) % 50),
      frameRate: assetNum % 3 === 0 ? 24 : assetNum % 3 === 1 ? 30 : 60,
      tags: ['stock-footage', 'professional', '4k'],
      fileKey: `uploads/${id}/original.mp4`,
      fileUrl: `https://mock-s3.example.com/uploads/${id}/original.mp4`,
    }

    if (status === 'published') {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
      asset.approvedAt = new Date(new Date(createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString()
      asset.publishedAt = new Date(new Date(createdAt).getTime() + 72 * 60 * 60 * 1000).toISOString()
    } else if (['submitted', 'review'].includes(status)) {
      asset.submittedAt = new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
    }

    return asset
  }

  return null
}

/**
 * GET /api/assets/[id] - Get asset detail
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  const { id } = await params
  const asset = generateMockAsset(id)

  if (!asset) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ data: asset })
}

/**
 * PATCH /api/assets/[id] - Update asset metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  const { id } = await params
  const asset = generateMockAsset(id)

  if (!asset) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  try {
    const updates = await request.json()

    // Update allowed fields
    const updatedAsset = {
      ...asset,
      ...updates,
      id: asset.id, // Prevent ID change
      type: asset.type, // Prevent type change
      updatedAt: new Date().toISOString(),
    }

    // Log mock audit entry
    console.log(`[AUDIT] Asset ${id} updated:`, updates)

    return NextResponse.json({ data: updatedAsset })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
