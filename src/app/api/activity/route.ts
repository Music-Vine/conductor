import { NextRequest, NextResponse } from 'next/server'
import type { PaginatedResponse, SystemActivityEntry, ActivityEntityType } from '@/types'

/**
 * Mock staff actors who perform actions.
 */
const ACTORS = [
  { id: 'staff-1', name: 'Sarah Johnson' },
  { id: 'staff-2', name: 'Alex Thompson' },
  { id: 'staff-3', name: 'Maria Garcia' },
  { id: 'staff-4', name: 'Michael Chen' },
]

/**
 * Asset-related activity templates.
 */
const ASSET_ACTIVITIES: Array<{ action: string; detailsFn: (entityName: string) => string }> = [
  { action: 'Approved', detailsFn: (n) => `${n} approved and moved to Published` },
  { action: 'Rejected', detailsFn: (n) => `${n} rejected: Audio quality issues detected` },
  { action: 'Uploaded', detailsFn: (n) => `${n} uploaded and submitted for review` },
  { action: 'Workflow advanced', detailsFn: (n) => `${n} moved from Initial Review to Quality Check` },
  { action: 'Workflow advanced', detailsFn: (n) => `${n} moved from Quality Check to Platform Assignment` },
  { action: 'Platform assigned', detailsFn: (n) => `${n} assigned to Music Vine` },
  { action: 'Platform assigned', detailsFn: (n) => `${n} assigned to Uppbeat` },
  { action: 'Unpublished', detailsFn: (n) => `${n} taken down from platform` },
  { action: 'Metadata updated', detailsFn: (n) => `${n} title, genre, and tags updated` },
]

/**
 * User-related activity templates.
 */
const USER_ACTIVITIES: Array<{ action: string; detailsFn: (entityName: string) => string }> = [
  { action: 'Suspended', detailsFn: (n) => `Account for ${n} suspended` },
  { action: 'Unsuspended', detailsFn: (n) => `Account for ${n} reinstated` },
  { action: 'Refund issued', detailsFn: (n) => `Refund processed for ${n}` },
  { action: 'OAuth disconnected', detailsFn: (n) => `Google OAuth disconnected for ${n}` },
  { action: 'OAuth disconnected', detailsFn: (n) => `Spotify OAuth disconnected for ${n}` },
]

/**
 * Contributor-related activity templates.
 */
const CONTRIBUTOR_ACTIVITIES: Array<{ action: string; detailsFn: (entityName: string) => string }> = [
  { action: 'Payee assigned', detailsFn: (n) => `Payee added to ${n} at 50% rate` },
  { action: 'Rate changed', detailsFn: (n) => `${n} payee split updated` },
  { action: 'Status updated', detailsFn: (n) => `${n} status changed to Active` },
  { action: 'Profile updated', detailsFn: (n) => `${n} contact details updated` },
]

/**
 * Payee-related activity templates.
 */
const PAYEE_ACTIVITIES: Array<{ action: string; detailsFn: (entityName: string) => string }> = [
  { action: 'Payee created', detailsFn: (n) => `${n} added to the system` },
  { action: 'Rate changed', detailsFn: (n) => `${n} rate updated to 30%` },
  { action: 'Contributor removed', detailsFn: (n) => `Contributor removed from ${n}` },
  { action: 'Payment details updated', detailsFn: (n) => `${n} bank details updated` },
  { action: 'Profile updated', detailsFn: (n) => `${n} contact information updated` },
]

/**
 * Build a human-readable entity name for a given type and numeric seed.
 */
function entityNameFor(entityType: ActivityEntityType, seed: number): string {
  switch (entityType) {
    case 'asset':
      return `Music Track ${seed}`
    case 'user': {
      const userEmails = [
        'james@example.com', 'mary.smith@example.com', 'robert.jones@example.com',
        'patricia.garcia@example.com', 'michael.miller@example.com', 'linda.davis@example.com',
        'william.rodriguez@example.com', 'elizabeth.martinez@example.com', 'david.hernandez@example.com',
        'barbara.lopez@example.com',
      ]
      return userEmails[seed % userEmails.length]
    }
    case 'contributor': {
      const contributorNames = [
        'Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson',
        'David Martinez', 'Rachel Kim', 'James Brown', 'Lisa Anderson',
      ]
      return `Contributor: ${contributorNames[seed % contributorNames.length]}`
    }
    case 'payee': {
      const payeeNames = [
        'Acme Records', 'Blue Note Publishing', 'Sunrise Music Group',
        'Pacific Sounds', 'Nordic Beat Lab', 'Urban Rhythm Co',
      ]
      return `Payee: ${payeeNames[seed % payeeNames.length]}`
    }
  }
}

/**
 * Derive an entity ID from its type and numeric seed.
 */
function entityIdFor(entityType: ActivityEntityType, seed: number): string {
  switch (entityType) {
    case 'asset':
      return `asset-${seed}`
    case 'user':
      return `user-${seed}`
    case 'contributor':
      return `contrib-${String((seed % 20) + 1).padStart(3, '0')}`
    case 'payee':
      return `payee-${String((seed % 10) + 1).padStart(3, '0')}`
  }
}

/**
 * Generate ~200 deterministic mock system activity entries.
 * Uses index-based arithmetic only — no Math.random() — so the
 * data set is stable across cold starts.
 */
function generateSystemActivity(): SystemActivityEntry[] {
  const entries: SystemActivityEntry[] = []

  // Fixed reference epoch: 30 days ago from a stable point in time.
  // We pin this to a fixed timestamp so the data doesn't drift on every call.
  const BASE_EPOCH = 1772100000000 // ~2026-02-27 00:00:00 UTC (pinned)
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
  const rangeStart = BASE_EPOCH - THIRTY_DAYS_MS

  // We generate exactly 200 entries; each gets a deterministic time offset
  // spread evenly across the 30-day window.
  const TOTAL = 200
  const timeStep = Math.floor(THIRTY_DAYS_MS / TOTAL)

  // Entity type rotation: weight asset events more heavily as they are most common
  const entityTypePattern: ActivityEntityType[] = [
    'asset', 'asset', 'asset', 'user', 'asset', 'contributor', 'asset', 'asset', 'payee', 'user',
  ]

  for (let i = 0; i < TOTAL; i++) {
    const entityType = entityTypePattern[i % entityTypePattern.length]

    // Deterministic seed per entry (ensures stable names/IDs)
    const seed = (i * 13 + 7) % 100

    // Pick actor deterministically
    const actor = ACTORS[i % ACTORS.length]

    // Pick activity template for entity type
    let templates: typeof ASSET_ACTIVITIES
    switch (entityType) {
      case 'asset': templates = ASSET_ACTIVITIES; break
      case 'user': templates = USER_ACTIVITIES; break
      case 'contributor': templates = CONTRIBUTOR_ACTIVITIES; break
      case 'payee': templates = PAYEE_ACTIVITIES; break
    }
    const template = templates[i % templates.length]

    const entityId = entityIdFor(entityType, seed + 1)
    const entityName = entityNameFor(entityType, seed)

    // Entries sorted newest first: index 0 = most recent, index TOTAL-1 = oldest
    const createdAt = new Date(rangeStart + (TOTAL - 1 - i) * timeStep).toISOString()

    entries.push({
      id: `sys-activity-${i + 1}`,
      entityType,
      entityId,
      entityName,
      action: template.action,
      actorId: actor.id,
      actorName: actor.name,
      details: template.detailsFn(entityName),
      createdAt,
    })
  }

  // Already sorted newest-first by construction (index 0 has the highest timestamp)
  return entries
}

/**
 * GET /api/activity - System-wide activity feed
 *
 * Query params:
 *   - limit (default 50, max 200)
 *   - page (default 1)
 *   - entityType ('asset' | 'user' | 'contributor' | 'payee')
 *   - entityId (string — filter to a specific entity)
 */
export async function GET(request: NextRequest) {
  // Simulate network latency (consistent with other mock routes)
  await new Promise(resolve => setTimeout(resolve, 50 + 25))

  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
  const entityTypeParam = searchParams.get('entityType') as ActivityEntityType | null
  const entityIdParam = searchParams.get('entityId')

  let entries = generateSystemActivity()

  // Apply entityType filter
  if (entityTypeParam) {
    entries = entries.filter(e => e.entityType === entityTypeParam)
  }

  // Apply entityId filter
  if (entityIdParam) {
    entries = entries.filter(e => e.entityId === entityIdParam)
  }

  // Paginate
  const totalItems = entries.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))
  const start = (page - 1) * limit
  const pageData = entries.slice(start, start + limit)

  const response: PaginatedResponse<SystemActivityEntry> = {
    data: pageData,
    pagination: {
      page,
      pageSize: pageData.length,
      totalPages,
      totalItems,
    },
  }

  return NextResponse.json(response)
}
