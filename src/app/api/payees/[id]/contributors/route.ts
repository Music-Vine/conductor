import { NextRequest, NextResponse } from 'next/server'

const CONTRIBUTOR_NAMES = [
  'Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson',
  'David Martinez', 'Rachel Kim', 'James Brown', 'Lisa Anderson',
  'Chris Taylor', 'Maria Garcia', 'Kevin White', 'Jennifer Lee',
  'Tom Harris', 'Sophie Clark', 'Daniel Moore', 'Olivia Davis',
  'Ryan Miller', 'Nicole Taylor', 'Brandon Scott', 'Amanda Green',
]

interface PayeeContributorEntry {
  contributorId: string
  contributorName: string
  contributorEmail: string
  percentageRate: number
  effectiveDate: string
}

/**
 * Percentage rate configurations that sum to exactly 100%.
 */
const RATE_CONFIGS: Record<number, number[][]> = {
  1: [[100]],
  2: [[70, 30], [60, 40]],
  3: [[50, 30, 20], [40, 35, 25]],
  4: [[40, 30, 20, 10], [35, 25, 25, 15]],
}

/**
 * Generate mock contributors for a payee using the payee ID as seed.
 * Performs a reverse lookup of which contributors point to this payee.
 */
function generatePayeeContributors(payeeIdNum: number): PayeeContributorEntry[] {
  // Generate 1-4 contributors per payee based on payee id seed
  const count = (payeeIdNum % 4) + 1
  const configs = RATE_CONFIGS[count]
  const configIndex = (payeeIdNum * 2) % configs.length
  const rates = configs[configIndex]

  const BASE_EPOCH = 1700000000000
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

  const contributors: PayeeContributorEntry[] = []

  for (let i = 0; i < count; i++) {
    // Pick contributor IDs deterministically based on payee seed
    const contributorIndex = ((payeeIdNum * 5 + i * 3) % 20) + 1
    const name = CONTRIBUTOR_NAMES[contributorIndex - 1]
    const firstName = name.split(' ')[0].toLowerCase()
    const lastName = name.split(' ')[1].toLowerCase()

    const effectiveDate = new Date(BASE_EPOCH - ONE_YEAR_MS + (payeeIdNum * i * 15 * 24 * 60 * 60 * 1000 % ONE_YEAR_MS)).toISOString()

    contributors.push({
      contributorId: `contrib-${String(contributorIndex).padStart(3, '0')}`,
      contributorName: name,
      contributorEmail: `${firstName}.${lastName}@example.com`,
      percentageRate: rates[i],
      effectiveDate,
    })
  }

  return contributors
}

/**
 * GET /api/payees/[id]/contributors - Get contributors associated with a payee (reverse lookup).
 */
export async function GET(
  _request: NextRequest,
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

  const contributors = generatePayeeContributors(idNum)

  return NextResponse.json({ data: contributors })
}
