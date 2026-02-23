import { NextRequest, NextResponse } from 'next/server'
import type { ContributorListItem, ContributorStatus, PaginatedResponse } from '@/types'

const CONTRIBUTOR_NAMES = [
  'Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson',
  'David Martinez', 'Rachel Kim', 'James Brown', 'Lisa Anderson',
  'Chris Taylor', 'Maria Garcia', 'Kevin White', 'Jennifer Lee',
  'Tom Harris', 'Sophie Clark', 'Daniel Moore', 'Olivia Davis',
  'Ryan Miller', 'Nicole Taylor', 'Brandon Scott', 'Amanda Green',
]

/**
 * Generate mock contributor list items with deterministic seeded data.
 */
function generateMockContributors(): ContributorListItem[] {
  const contributors: ContributorListItem[] = []

  // Use a fixed epoch base for reproducible timestamps
  const BASE_EPOCH = 1700000000000 // Fixed reference point
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

  for (let i = 1; i <= 20; i++) {
    const name = CONTRIBUTOR_NAMES[i - 1]
    const firstName = name.split(' ')[0].toLowerCase()
    const lastName = name.split(' ')[1].toLowerCase()

    // Status distribution: 18 active, 1 pending (index 19), 1 inactive (index 20)
    let status: ContributorStatus
    if (i < 19) status = 'active'
    else if (i === 19) status = 'pending'
    else status = 'inactive'

    // Deterministic asset/payee counts using id seed
    const totalAssets = ((i * 7) % 48) + 1
    const totalPayees = (i % 3) + 1

    // Deterministic timestamps
    const createdAt = new Date(BASE_EPOCH - ONE_YEAR_MS + (i * 17 * 24 * 60 * 60 * 1000)).toISOString()

    contributors.push({
      id: `contrib-${String(i).padStart(3, '0')}`,
      name,
      email: `${firstName}.${lastName}@example.com`,
      status,
      totalAssets,
      totalPayees,
      createdAt,
    })
  }

  return contributors
}

/**
 * GET /api/contributors - List contributors with search, status filtering and pagination.
 */
export async function GET(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 150))

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')?.toLowerCase()
  const status = searchParams.get('status') as ContributorStatus | null
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  let contributors = generateMockContributors()

  // Apply search filter
  if (query) {
    contributors = contributors.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (status) {
    contributors = contributors.filter(c => c.status === status)
  }

  // Sort by name
  contributors.sort((a, b) => a.name.localeCompare(b.name))

  // Pagination
  const totalItems = contributors.length
  const totalPages = Math.ceil(totalItems / limit)
  const start = (page - 1) * limit
  const paginatedContributors = contributors.slice(start, start + limit)

  const response: PaginatedResponse<ContributorListItem> = {
    data: paginatedContributors,
    pagination: {
      page,
      pageSize: paginatedContributors.length,
      totalPages,
      totalItems,
    },
  }

  return NextResponse.json(response)
}

/**
 * POST /api/contributors - Create a new contributor.
 */
export async function POST(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200))

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 }
    )
  }

  const now = new Date().toISOString()
  const newContributor: ContributorListItem = {
    id: `contrib-${String(Math.floor(Math.random() * 900) + 100)}`,
    name: body.name as string,
    email: body.email as string,
    status: 'pending',
    totalAssets: 0,
    totalPayees: 0,
    createdAt: now,
  }

  return NextResponse.json({ data: newContributor }, { status: 201 })
}
