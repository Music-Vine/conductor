import { NextRequest, NextResponse } from 'next/server'
import type { ContributorPayee, PaymentMethod } from '@/types'
import { proxyToBackend } from '@/lib/api/proxy'

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

/**
 * Percentage rate configurations that sum to exactly 100%.
 * 1 payee: 100%
 * 2 payees: 70/30 or 60/40
 * 3 payees: 50/30/20 or 40/35/25
 */
const RATE_CONFIGS: Record<number, number[][]> = {
  1: [[100]],
  2: [[70, 30], [60, 40]],
  3: [[50, 30, 20], [40, 35, 25]],
}

/**
 * Generate mock payee relationships for a contributor using the contributor ID as seed.
 */
function generateContributorPayees(contributorId: string, idNum: number): ContributorPayee[] {
  // Determine how many payees (1, 2, or 3) based on contributor id
  const numPayees = (idNum % 3) + 1

  // Pick a rate configuration
  const configs = RATE_CONFIGS[numPayees]
  const configIndex = Math.floor(idNum / 3) % configs.length
  const rates = configs[configIndex]

  const BASE_EPOCH = 1700000000000
  const effectiveDate = new Date(BASE_EPOCH - ((20 - idNum) * 30 * 24 * 60 * 60 * 1000)).toISOString()
  const createdAt = effectiveDate
  const updatedAt = new Date(BASE_EPOCH - (idNum * 5 * 24 * 60 * 60 * 1000)).toISOString()

  return rates.map((rate, index) => {
    // Pick payee IDs in a deterministic, distributed manner
    const payeeIndex = ((idNum * 3 + index * 7) % 10) + 1

    return {
      contributorId,
      payeeId: `payee-${String(payeeIndex).padStart(3, '0')}`,
      payeeName: PAYEE_NAMES[payeeIndex - 1],
      payeeEmail: PAYEE_EMAILS[payeeIndex - 1],
      paymentMethod: PAYMENT_METHODS[payeeIndex - 1],
      percentageRate: rate,
      effectiveDate,
      notes: index === 0 ? 'Primary publishing rights' : index === 1 ? 'Secondary royalty share' : 'Additional share',
      createdAt,
      updatedAt,
    }
  })
}

/**
 * GET /api/contributors/[id]/payees - Get payee relationships for a contributor.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const result = await proxyToBackend(request, `/admin/contributors/${id}/payees`)
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 100))

  const idNum = parseInt(id.replace('contrib-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 20) {
    return NextResponse.json(
      { error: 'Contributor not found' },
      { status: 404 }
    )
  }

  const relationships = generateContributorPayees(id, idNum)

  return NextResponse.json({ data: relationships })
}

/**
 * POST /api/contributors/[id]/payees - Save payee assignments for a contributor.
 * Validates that percentageRates sum to exactly 100%.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contributorId } = await params

  let body: { payees?: Array<{ payeeId: string; percentageRate: number; effectiveDate: string; notes?: string }> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const result = await proxyToBackend(request, `/admin/contributors/${contributorId}/payees`, {
    method: 'POST',
    body,
  })
  if (result !== null) {
    if (result instanceof NextResponse) return result
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200))

  const idNum = parseInt(contributorId.replace('contrib-', ''), 10)

  if (isNaN(idNum) || idNum < 1 || idNum > 20) {
    return NextResponse.json(
      { error: 'Contributor not found' },
      { status: 404 }
    )
  }

  // Validate payees array
  if (!Array.isArray(body.payees) || body.payees.length === 0) {
    return NextResponse.json(
      { error: 'Payees array is required and must not be empty' },
      { status: 400 }
    )
  }

  // Validate sum equals exactly 100%
  const totalPercentage = body.payees.reduce(
    (sum, p) => sum + (typeof p.percentageRate === 'number' ? p.percentageRate : 0),
    0
  )

  if (totalPercentage !== 100) {
    return NextResponse.json(
      {
        error: 'Percentage rates must sum to exactly 100%',
        totalPercentage,
        message: totalPercentage < 100
          ? `Total is ${totalPercentage}%. Please assign the remaining ${100 - totalPercentage}%.`
          : `Total is ${totalPercentage}%. Please reduce by ${totalPercentage - 100}%.`,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({
    message: 'Payee assignments updated successfully',
    contributorId,
    totalPercentage,
    payeeCount: body.payees.length,
  })
}
