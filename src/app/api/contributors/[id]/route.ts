import { NextResponse } from 'next/server'
import type { Contributor, ContributorStatus } from '@/types'

const CONTRIBUTOR_NAMES = [
  'Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson',
  'David Martinez', 'Rachel Kim', 'James Brown', 'Lisa Anderson',
  'Chris Taylor', 'Maria Garcia', 'Kevin White', 'Jennifer Lee',
  'Tom Harris', 'Sophie Clark', 'Daniel Moore', 'Olivia Davis',
  'Ryan Miller', 'Nicole Taylor', 'Brandon Scott', 'Amanda Green',
]

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Nashville', 'Austin', 'Seattle', 'Miami', 'Denver']
const STATES = ['NY', 'CA', 'IL', 'TN', 'TX', 'WA', 'FL', 'CO']
const STREETS = ['123 Main St', '456 Oak Ave', '789 Elm Blvd', '321 Pine Rd', '654 Maple Dr']

/**
 * Generate full contributor detail from a numeric ID.
 */
function generateMockContributorDetail(idNum: number): Contributor {
  const name = CONTRIBUTOR_NAMES[idNum - 1]
  const firstName = name.split(' ')[0].toLowerCase()
  const lastName = name.split(' ')[1].toLowerCase()

  // Status distribution: 18 active, 1 pending (index 19), 1 inactive (index 20)
  let status: ContributorStatus
  if (idNum < 19) status = 'active'
  else if (idNum === 19) status = 'pending'
  else status = 'inactive'

  const totalAssets = ((idNum * 7) % 48) + 1
  const totalPayees = (idNum % 3) + 1

  // Deterministic timestamps
  const BASE_EPOCH = 1700000000000
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
  const createdAt = new Date(BASE_EPOCH - ONE_YEAR_MS + (idNum * 17 * 24 * 60 * 60 * 1000)).toISOString()
  const updatedAt = new Date(BASE_EPOCH - (idNum * 3 * 24 * 60 * 60 * 1000)).toISOString()

  // Deterministic phone using id seed
  const areaCode = 200 + (idNum * 13) % 800
  const prefix = 100 + (idNum * 37) % 900
  const line = 1000 + (idNum * 123) % 9000

  const cityIndex = idNum % CITIES.length
  const streetIndex = idNum % STREETS.length

  return {
    id: `contrib-${String(idNum).padStart(3, '0')}`,
    name,
    email: `${firstName}.${lastName}@example.com`,
    phone: `+1-${areaCode}-${prefix}-${line}`,
    taxId: `XX-XXX${String((idNum * 1234) % 9000 + 1000)}`,
    address: {
      street: STREETS[streetIndex],
      city: CITIES[cityIndex],
      state: STATES[cityIndex],
      zip: String(10000 + (idNum * 317) % 90000),
      country: 'US',
    },
    status,
    totalAssets,
    totalPayees,
    createdAt,
    updatedAt,
  }
}

/**
 * GET /api/contributors/[id] - Get full contributor detail.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  const { id } = await params
  const idNum = parseInt(id.replace('contrib-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 20) {
    return NextResponse.json(
      { error: 'Contributor not found' },
      { status: 404 }
    )
  }

  const contributor = generateMockContributorDetail(idNum)
  return NextResponse.json(contributor)
}

/**
 * PUT /api/contributors/[id] - Update contributor details.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200))

  const { id } = await params
  const idNum = parseInt(id.replace('contrib-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 20) {
    return NextResponse.json(
      { error: 'Contributor not found' },
      { status: 404 }
    )
  }

  let body: Partial<Contributor>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const existing = generateMockContributorDetail(idNum)
  const updated: Contributor = {
    ...existing,
    ...body,
    id: existing.id, // Prevent ID override
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updated)
}
