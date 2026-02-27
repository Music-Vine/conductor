import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * Activity log entry for asset changes.
 */
export interface ActivityEntry {
  id: string
  action: string
  actorId: string
  actorName: string
  details: string
  createdAt: string
}

/**
 * Generate mock activity log entries for an asset.
 */
function generateActivityLog(assetId: string): ActivityEntry[] {
  const activities: ActivityEntry[] = []

  const actors = [
    { id: 'user-1', name: 'Sarah Johnson' },
    { id: 'user-2', name: 'Alex Thompson' },
    { id: 'user-3', name: 'Michael Chen' },
    { id: 'user-4', name: 'Emma Wilson' },
  ]

  // Parse asset ID to determine seed for consistent data
  const match = assetId.match(/^asset-(\d+)$/)
  const assetNum = match ? parseInt(match[1], 10) : 1

  const baseTime = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
  let activityId = 1
  let currentTime = baseTime

  // Asset created
  const creator = actors[assetNum % actors.length]
  activities.push({
    id: `activity-${activityId++}`,
    action: 'Created asset',
    actorId: creator.id,
    actorName: creator.name,
    details: 'Initial upload and metadata entry',
    createdAt: new Date(currentTime).toISOString(),
  })
  currentTime += (1 * 24 * 60 * 60 * 1000) // +1 day

  // Metadata updated (if asset number is even)
  if (assetNum % 2 === 0) {
    const editor = actors[(assetNum + 1) % actors.length]
    activities.push({
      id: `activity-${activityId++}`,
      action: 'Updated metadata',
      actorId: editor.id,
      actorName: editor.name,
      details: 'Updated title, tags, and description',
      createdAt: new Date(currentTime).toISOString(),
    })
    currentTime += (2 * 24 * 60 * 60 * 1000) // +2 days
  }

  // Status changed to submitted
  if (assetNum % 10 !== 0) { // 90% of assets are submitted
    const submitter = actors[assetNum % actors.length]
    activities.push({
      id: `activity-${activityId++}`,
      action: 'Changed status',
      actorId: submitter.id,
      actorName: submitter.name,
      details: 'Status changed from Draft to Submitted',
      createdAt: new Date(currentTime).toISOString(),
    })
    currentTime += (1 * 24 * 60 * 60 * 1000) // +1 day
  }

  // Status changed to review
  if (assetNum % 5 !== 0) { // 80% move to review
    const reviewer = actors[(assetNum + 2) % actors.length]
    activities.push({
      id: `activity-${activityId++}`,
      action: 'Changed status',
      actorId: reviewer.id,
      actorName: reviewer.name,
      details: 'Status changed from Submitted to Initial Review',
      createdAt: new Date(currentTime).toISOString(),
    })
    currentTime += (3 * 24 * 60 * 60 * 1000) // +3 days
  }

  // Platform changed (for music assets)
  if (assetNum <= 300 && assetNum % 3 === 0) { // 33% of music assets
    const platformChanger = actors[(assetNum + 3) % actors.length]
    const platforms = ['Music Vine only', 'Uppbeat only', 'Both platforms']
    activities.push({
      id: `activity-${activityId++}`,
      action: 'Changed platform',
      actorId: platformChanger.id,
      actorName: platformChanger.name,
      details: `Platform assignment changed to ${platforms[assetNum % platforms.length]}`,
      createdAt: new Date(currentTime).toISOString(),
    })
    currentTime += (1 * 24 * 60 * 60 * 1000) // +1 day
  }

  // Additional metadata update
  if (assetNum % 4 === 0) {
    const editor = actors[(assetNum + 1) % actors.length]
    activities.push({
      id: `activity-${activityId++}`,
      action: 'Updated metadata',
      actorId: editor.id,
      actorName: editor.name,
      details: 'Updated genre and BPM information',
      createdAt: new Date(currentTime).toISOString(),
    })
    currentTime += (1 * 24 * 60 * 60 * 1000) // +1 day
  }

  // Status changed to approved/published (for older assets)
  if (assetNum % 3 === 0 && assetNum % 5 !== 0) {
    const approver = actors[(assetNum + 2) % actors.length]
    activities.push({
      id: `activity-${activityId++}`,
      action: 'Approved asset',
      actorId: approver.id,
      actorName: approver.name,
      details: 'Status changed to Published',
      createdAt: new Date(currentTime).toISOString(),
    })
    currentTime += (1 * 24 * 60 * 60 * 1000) // +1 day
  }

  // Rejection (for some assets)
  if (assetNum % 11 === 0) {
    const rejector = actors[(assetNum + 3) % actors.length]
    activities.push({
      id: `activity-${activityId++}`,
      action: 'Rejected asset',
      actorId: rejector.id,
      actorName: rejector.name,
      details: 'Asset rejected: Audio quality issues detected',
      createdAt: new Date(currentTime).toISOString(),
    })
    currentTime += (1 * 24 * 60 * 60 * 1000) // +1 day
  }

  // Sort by createdAt descending (newest first)
  return activities.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * GET /api/assets/[id]/activity - Get activity log for asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const result = await proxyToBackend(request, `/admin/assets/${id}/activity`)
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50))

  // Validate asset ID format
  const match = id.match(/^asset-(\d+)$/)
  if (!match) {
    return NextResponse.json(
      { error: 'Asset not found' },
      { status: 404 }
    )
  }

  const activityLog = generateActivityLog(id)

  return NextResponse.json({ data: activityLog })
}
