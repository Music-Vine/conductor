import { NextResponse } from 'next/server'
import type { Payee, PayeeStatus, PaymentMethod } from '@/types'

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

const PAYMENT_METHODS: PaymentMethod[] = [
  'ach', 'paypal', 'wire', 'ach', 'paypal', 'ach', 'wire', 'ach', 'paypal', 'check',
]

const CITIES = ['New York', 'Los Angeles', 'Nashville', 'Austin', 'Seattle', 'Chicago', 'Miami', 'Denver', 'Portland', 'Atlanta']
const STATES = ['NY', 'CA', 'TN', 'TX', 'WA', 'IL', 'FL', 'CO', 'OR', 'GA']

/**
 * Generate full payee detail from a numeric ID.
 */
function generateMockPayeeDetail(idNum: number): Payee {
  const paymentMethod = PAYMENT_METHODS[idNum - 1]
  const status: PayeeStatus = idNum <= 9 ? 'active' : 'inactive'
  const totalContributors = ((idNum * 3) % 4) + 1

  // Deterministic timestamps
  const BASE_EPOCH = 1700000000000
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
  const createdAt = new Date(BASE_EPOCH - ONE_YEAR_MS + (idNum * 23 * 24 * 60 * 60 * 1000)).toISOString()
  const updatedAt = new Date(BASE_EPOCH - (idNum * 5 * 24 * 60 * 60 * 1000)).toISOString()

  // Build payment details based on method
  const accountSeed = String((idNum * 5678) % 100000000).padStart(8, '0')
  const routingSeed = String(121000000 + (idNum * 313) % 100000)

  let paymentDetails: Payee['paymentDetails'] = {}
  if (paymentMethod === 'ach' || paymentMethod === 'wire') {
    paymentDetails = {
      accountNumber: `****${accountSeed.slice(-4)}`,
      routingNumber: routingSeed,
    }
  } else if (paymentMethod === 'paypal') {
    paymentDetails = {
      paypalEmail: PAYEE_EMAILS[idNum - 1],
    }
  }

  const cityIndex = idNum % CITIES.length

  return {
    id: `payee-${String(idNum).padStart(3, '0')}`,
    name: PAYEE_NAMES[idNum - 1],
    email: PAYEE_EMAILS[idNum - 1],
    phone: `+1-${200 + (idNum * 17) % 800}-${100 + (idNum * 43) % 900}-${1000 + (idNum * 567) % 9000}`,
    taxId: `XX-XXX${String((idNum * 2345) % 9000 + 1000)}`,
    paymentMethod,
    paymentDetails,
    address: {
      street: `${100 + idNum * 11} Commerce Blvd`,
      city: CITIES[cityIndex],
      state: STATES[cityIndex],
      zip: String(10000 + (idNum * 419) % 90000),
      country: 'US',
    },
    status,
    totalContributors,
    createdAt,
    updatedAt,
  }
}

/**
 * GET /api/payees/[id] - Get full payee detail.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  const { id } = await params
  const idNum = parseInt(id.replace('payee-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 10) {
    return NextResponse.json(
      { error: 'Payee not found' },
      { status: 404 }
    )
  }

  const payee = generateMockPayeeDetail(idNum)
  return NextResponse.json(payee)
}

/**
 * PUT /api/payees/[id] - Update payee details.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200))

  const { id } = await params
  const idNum = parseInt(id.replace('payee-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 10) {
    return NextResponse.json(
      { error: 'Payee not found' },
      { status: 404 }
    )
  }

  let body: Partial<Payee>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const existing = generateMockPayeeDetail(idNum)
  const updated: Payee = {
    ...existing,
    ...body,
    id: existing.id, // Prevent ID override
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(updated)
}
