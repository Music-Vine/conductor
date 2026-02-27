import { NextRequest, NextResponse } from 'next/server'
import type { UserDetail, UserStatus, SubscriptionTier, Platform, OAuthConnection } from '@/types'
import { proxyToBackend } from '@/lib/api/proxy'

/**
 * Generate detailed mock user data based on ID.
 */
function generateMockUserDetail(id: string): UserDetail {
  // Extract number from ID for consistent data generation
  const idNum = parseInt(id.replace('user-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 100) {
    throw new Error('Invalid user ID')
  }

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

  const firstName = firstNames[idNum % firstNames.length]
  const lastName = lastNames[Math.floor(idNum / 5) % lastNames.length]
  const name = `${firstName} ${lastName}`
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${idNum}`
  const email = `${username}@example.com`

  // 90% active, 10% suspended
  const status: UserStatus = (idNum % 10) === 2 ? 'suspended' : 'active'

  // 40% free, 30% creator, 20% pro, 10% enterprise
  let tier: SubscriptionTier
  const tierMod = idNum % 10
  if (tierMod < 4) tier = 'free'
  else if (tierMod < 7) tier = 'creator'
  else if (tierMod < 9) tier = 'pro'
  else tier = 'enterprise'

  const platforms: Platform[] = ['music-vine', 'uppbeat']
  const platform = platforms[idNum % platforms.length]

  // Random lastLoginAt within last 30 days
  const now = Date.now()
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
  const loginSeed = idNum * 123456
  const lastLoginAt = new Date(thirtyDaysAgo + (loginSeed % (now - thirtyDaysAgo))).toISOString()

  // CreatedAt sometime in the past year
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
  const createSeed = idNum * 654321
  const createdAt = new Date(oneYearAgo + (createSeed % (now - oneYearAgo))).toISOString()

  // Suspension details
  const suspendedAt = status === 'suspended' ? new Date(now - (idNum * 24 * 60 * 60 * 1000)).toISOString() : null
  const suspendedReason = status === 'suspended'
    ? ['Violation of terms of service', 'Payment fraud detected', 'Suspicious activity', 'DMCA complaint'][idNum % 4]
    : null

  // OAuth connections (0-2 Google connections only - we don't support Facebook)
  const oauthConnections: OAuthConnection[] = []
  const connectionCount = idNum % 3 // 0, 1, or 2 connections

  if (connectionCount >= 1) {
    oauthConnections.push({
      provider: 'google',
      connectedAt: new Date(now - (idNum * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      email: `${username}@gmail.com`,
    })
  }

  if (connectionCount >= 2) {
    oauthConnections.push({
      provider: 'google',
      connectedAt: new Date(now - (idNum * 14 * 24 * 60 * 60 * 1000)).toISOString(),
      email: `${username}.work@gmail.com`,
    })
  }

  // Subscription details
  const subscriptionStartedAt = new Date(now - (idNum * 30 * 24 * 60 * 60 * 1000)).toISOString()
  const subscriptionExpiresAt = tier === 'free'
    ? null
    : new Date(now + (idNum * 30 * 24 * 60 * 60 * 1000)).toISOString()

  // Usage stats
  const downloadCount = Math.floor((idNum * 37) % 500)
  const licenseCount = Math.floor((idNum * 13) % 50)

  return {
    id,
    email,
    name,
    username,
    status,
    subscriptionTier: tier,
    platform,
    lastLoginAt,
    createdAt,
    suspendedAt,
    suspendedReason,
    oauthConnections,
    subscription: {
      tier,
      startedAt: subscriptionStartedAt,
      expiresAt: subscriptionExpiresAt,
      billingEmail: email,
    },
    downloadCount,
    licenseCount,
  }
}

/**
 * PATCH /api/users/[id] - Partially update user details.
 *
 * Security note: email and status updates are intentionally disallowed here.
 * Those fields require dedicated endpoints with additional verification steps.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: Partial<Omit<UserDetail, 'id' | 'email' | 'status'>>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const result = await proxyToBackend(request, `/admin/users/${id}`, { method: 'PATCH', body })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))

  try {
    const existing = generateMockUserDetail(id)

    // Strip security-sensitive fields — email and status require dedicated endpoints
    const { email: _email, status: _status, ...safeUpdates } = body as Record<string, unknown>

    const updated: UserDetail = {
      ...existing,
      ...safeUpdates,
      id: existing.id, // Prevent ID override
      email: existing.email, // Email changes require dedicated verification flow
      status: existing.status, // Status changes require dedicated suspend/unsuspend endpoint
    }

    console.log(`[AUDIT] User ${id} updated (${new Date().toISOString()}):`, safeUpdates)

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'User not found',
        message: error instanceof Error ? error.message : 'Invalid user ID',
      },
      { status: 404 }
    )
  }
}

/**
 * GET /api/users/[id] - Get detailed user information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const result = await proxyToBackend(request, `/admin/users/${id}`)
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: adapt response shape when real backend format is known
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    const userDetail = generateMockUserDetail(id)
    return NextResponse.json(userDetail)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'User not found',
        message: error instanceof Error ? error.message : 'Invalid user ID'
      },
      { status: 404 }
    )
  }
}
