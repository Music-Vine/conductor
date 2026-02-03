import { NextResponse } from 'next/server'
import type { UserDetail, UserStatus, SubscriptionTier, Platform, OAuthConnection } from '@/types'

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

  // OAuth connections (0-3 connections)
  const oauthConnections: OAuthConnection[] = []
  const connectionCount = idNum % 4 // 0, 1, 2, or 3 connections

  if (connectionCount >= 1) {
    oauthConnections.push({
      provider: 'google',
      connectedAt: new Date(now - (idNum * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      email: `${username}@gmail.com`,
    })
  }

  if (connectionCount >= 2) {
    oauthConnections.push({
      provider: 'facebook',
      connectedAt: new Date(now - (idNum * 14 * 24 * 60 * 60 * 1000)).toISOString(),
      email: `${username}@facebook.com`,
    })
  }

  if (connectionCount >= 3) {
    oauthConnections.push({
      provider: 'google',
      connectedAt: new Date(now - (idNum * 21 * 24 * 60 * 60 * 1000)).toISOString(),
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
 * GET /api/users/[id] - Get detailed user information
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  const { id } = await params

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
