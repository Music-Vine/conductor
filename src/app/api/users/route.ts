import { NextRequest, NextResponse } from 'next/server'
import type { PaginatedResponse, UserListItem, UserStatus, SubscriptionTier, Platform } from '@/types'

/**
 * Generate mock user data.
 */
function generateMockUsers(): UserListItem[] {
  const users: UserListItem[] = []
  const statuses: UserStatus[] = ['active', 'suspended']
  const tiers: SubscriptionTier[] = ['free', 'creator', 'pro', 'enterprise']
  const platforms: Platform[] = ['music-vine', 'uppbeat']

  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[Math.floor(i / 5) % lastNames.length]
    const name = `${firstName} ${lastName}`
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`
    const email = `${username}@example.com`

    // 90% active, 10% suspended
    const status: UserStatus = Math.random() < 0.9 ? 'active' : 'suspended'

    // 30% free, 20% essentials, 25% creator, 15% pro, 10% enterprise
    let tier: SubscriptionTier
    const tierRand = Math.random()
    if (tierRand < 0.3) tier = 'free'
    else if (tierRand < 0.5) tier = 'essentials'
    else if (tierRand < 0.75) tier = 'creator'
    else if (tierRand < 0.9) tier = 'pro'
    else tier = 'enterprise'

    const platform: Platform = platforms[i % platforms.length]

    // Random lastLoginAt within last 30 days
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    const lastLoginAt = new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo)).toISOString()

    // CreatedAt sometime in the past year
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
    const createdAt = new Date(oneYearAgo + Math.random() * (now - oneYearAgo)).toISOString()

    users.push({
      id: `user-${i}`,
      email,
      name,
      username,
      status,
      subscriptionTier: tier,
      platform,
      lastLoginAt,
      createdAt,
    })
  }

  return users
}

/**
 * GET /api/users - List users with filtering and pagination
 */
export async function GET(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200))

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')?.toLowerCase()
  const status = searchParams.get('status') as UserStatus | null
  const tier = searchParams.get('tier') as SubscriptionTier | null
  const platform = searchParams.get('platform') as Platform | null
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  // Generate mock users
  let users = generateMockUsers()

  // Apply filters
  if (query) {
    users = users.filter(user =>
      user.email.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    )
  }

  if (status) {
    users = users.filter(user => user.status === status)
  }

  if (tier) {
    users = users.filter(user => user.subscriptionTier === tier)
  }

  if (platform) {
    users = users.filter(user => user.platform === platform)
  }

  // Calculate pagination
  const totalItems = users.length
  const totalPages = Math.ceil(totalItems / limit)
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedUsers = users.slice(start, end)

  const response: PaginatedResponse<UserListItem> = {
    data: paginatedUsers,
    pagination: {
      page,
      pageSize: paginatedUsers.length,
      totalPages,
      totalItems,
    },
  }

  return NextResponse.json(response)
}
