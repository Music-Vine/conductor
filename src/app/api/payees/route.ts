import { NextRequest, NextResponse } from 'next/server'
import type { PayeeListItem, PayeeStatus, PaymentMethod, PaginatedResponse } from '@/types'

const PAYEE_NAMES = [
  'Main Publishing LLC',
  'Alex Thompson Personal',
  'Studio Pro Inc',
  'Indie Music Group',
  'Harmony Rights Ltd',
  'Sarah Johnson Personal',
  'Blue Note Publishing',
  'Pacific Wave Music',
  'Creative Arts Partners',
  'Melody House LLC',
]

const PAYEE_EMAILS = [
  'payments@mainpublishing.com',
  'alex.thompson@example.com',
  'accounts@studiopro.com',
  'finance@indiemusicgroup.com',
  'rights@harmonyrights.co.uk',
  'sarah.johnson@example.com',
  'royalties@bluenote.com',
  'pay@pacificwave.com',
  'accounts@creativearts.com',
  'payments@melodyhouse.com',
]

// Payment methods distributed: 4 ACH, 3 PayPal, 2 wire, 1 check
const PAYMENT_METHODS: PaymentMethod[] = [
  'ach', 'paypal', 'wire', 'ach', 'paypal', 'ach', 'wire', 'ach', 'paypal', 'check',
]

/**
 * Generate mock payee list items with deterministic seeded data.
 */
function generateMockPayees(): PayeeListItem[] {
  const payees: PayeeListItem[] = []

  const BASE_EPOCH = 1700000000000
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

  for (let i = 1; i <= 10; i++) {
    const status: PayeeStatus = i <= 9 ? 'active' : 'inactive'
    const totalContributors = ((i * 3) % 4) + 1
    const createdAt = new Date(BASE_EPOCH - ONE_YEAR_MS + (i * 23 * 24 * 60 * 60 * 1000)).toISOString()

    payees.push({
      id: `payee-${String(i).padStart(3, '0')}`,
      name: PAYEE_NAMES[i - 1],
      email: PAYEE_EMAILS[i - 1],
      paymentMethod: PAYMENT_METHODS[i - 1],
      status,
      totalContributors,
      createdAt,
    })
  }

  return payees
}

/**
 * GET /api/payees - List payees with search, status, paymentMethod filtering and pagination.
 */
export async function GET(request: NextRequest) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 150))

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')?.toLowerCase()
  const status = searchParams.get('status') as PayeeStatus | null
  const paymentMethod = searchParams.get('paymentMethod') as PaymentMethod | null
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

  let payees = generateMockPayees()

  // Apply search filter
  if (query) {
    payees = payees.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (status) {
    payees = payees.filter(p => p.status === status)
  }

  // Apply payment method filter
  if (paymentMethod) {
    payees = payees.filter(p => p.paymentMethod === paymentMethod)
  }

  // Sort by name
  payees.sort((a, b) => a.name.localeCompare(b.name))

  // Pagination
  const totalItems = payees.length
  const totalPages = Math.ceil(totalItems / limit)
  const start = (page - 1) * limit
  const paginatedPayees = payees.slice(start, start + limit)

  const response: PaginatedResponse<PayeeListItem> = {
    data: paginatedPayees,
    pagination: {
      page,
      pageSize: paginatedPayees.length,
      totalPages,
      totalItems,
    },
  }

  return NextResponse.json(response)
}

/**
 * POST /api/payees - Create a new payee.
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
  if (!body.name || !body.email || !body.paymentMethod) {
    return NextResponse.json(
      { error: 'Name, email, and paymentMethod are required' },
      { status: 400 }
    )
  }

  const now = new Date().toISOString()
  const newPayee: PayeeListItem = {
    id: `payee-${String(Math.floor(Math.random() * 900) + 100)}`,
    name: body.name as string,
    email: body.email as string,
    paymentMethod: body.paymentMethod as PaymentMethod,
    status: 'active',
    totalContributors: 0,
    createdAt: now,
  }

  return NextResponse.json({ data: newPayee }, { status: 201 })
}
