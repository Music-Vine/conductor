import { NextRequest, NextResponse } from 'next/server'
import type { PaymentMethod, ContributorStatus, PayeeStatus } from '@/types'
import { proxyToBackend } from '@/lib/api/proxy'

const CONTRIBUTOR_NAMES = [
  'Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson',
  'David Martinez', 'Rachel Kim', 'James Brown', 'Lisa Anderson',
  'Chris Taylor', 'Maria Garcia', 'Kevin White', 'Jennifer Lee',
  'Tom Harris', 'Sophie Clark', 'Daniel Moore', 'Olivia Davis',
  'Ryan Miller', 'Nicole Taylor', 'Brandon Scott', 'Amanda Green',
]

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
 * Percentage rate configurations that sum to exactly 100% (stored as integers 0-100).
 */
const RATE_CONFIGS: Record<number, number[][]> = {
  1: [[100]],
  2: [[70, 30], [60, 40]],
  3: [[50, 30, 20], [40, 35, 25]],
}

interface FinancialExportRow {
  contributorId: string
  contributorName: string
  contributorEmail: string
  contributorStatus: ContributorStatus
  payeeId: string
  payeeName: string
  payeeEmail: string
  payeePaymentMethod: PaymentMethod
  payeeStatus: PayeeStatus
  /** Decimal percentage (0.00-1.00) for accounting system compatibility. */
  percentageRate: number
  effectiveDate: string
  createdAt: string
  updatedAt: string
}

/**
 * Generate all contributor-payee relationships in flat format for CSV export.
 * Approximately 40 relationships (20 contributors × avg 2 payees each).
 */
function generateFinancialExportRows(): FinancialExportRow[] {
  const rows: FinancialExportRow[] = []
  const BASE_EPOCH = 1700000000000
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

  for (let i = 1; i <= 20; i++) {
    const name = CONTRIBUTOR_NAMES[i - 1]
    const firstName = name.split(' ')[0].toLowerCase()
    const lastName = name.split(' ')[1].toLowerCase()

    let contributorStatus: ContributorStatus
    if (i < 19) contributorStatus = 'active'
    else if (i === 19) contributorStatus = 'pending'
    else contributorStatus = 'inactive'

    const contributorCreatedAt = new Date(BASE_EPOCH - ONE_YEAR_MS + (i * 17 * 24 * 60 * 60 * 1000)).toISOString()
    const contributorUpdatedAt = new Date(BASE_EPOCH - (i * 3 * 24 * 60 * 60 * 1000)).toISOString()

    // Determine payees for this contributor (same logic as contributor payees route)
    const numPayees = (i % 3) + 1
    const configs = RATE_CONFIGS[numPayees]
    const configIndex = Math.floor(i / 3) % configs.length
    const rates = configs[configIndex]

    const effectiveDate = new Date(BASE_EPOCH - ((20 - i) * 30 * 24 * 60 * 60 * 1000)).toISOString()

    rates.forEach((rate, index) => {
      const payeeIndex = ((i * 3 + index * 7) % 10) + 1
      const payeeStatus: PayeeStatus = payeeIndex <= 9 ? 'active' : 'inactive'

      rows.push({
        contributorId: `contrib-${String(i).padStart(3, '0')}`,
        contributorName: name,
        contributorEmail: `${firstName}.${lastName}@example.com`,
        contributorStatus,
        payeeId: `payee-${String(payeeIndex).padStart(3, '0')}`,
        payeeName: PAYEE_NAMES[payeeIndex - 1],
        payeeEmail: PAYEE_EMAILS[payeeIndex - 1],
        payeePaymentMethod: PAYMENT_METHODS[payeeIndex - 1],
        payeeStatus,
        // Convert integer percentage (0-100) to decimal (0.00-1.00) for accounting
        percentageRate: parseFloat((rate / 100).toFixed(4)),
        effectiveDate,
        createdAt: contributorCreatedAt,
        updatedAt: contributorUpdatedAt,
      })
    })
  }

  return rows
}

/**
 * GET /api/financials/export - Return all contributor-payee relationships for CSV export.
 * Returns flat format with decimal percentageRate (0.00-1.00) for accounting compatibility.
 */
export async function GET(request: NextRequest) {
  const result = await proxyToBackend(request, '/admin/financials/export')
  if (result !== null) {
    if (result instanceof NextResponse) return result
    // TODO: If backend returns raw JSON financial data, convert to CSV here
    // If backend returns CSV directly, pipe through with appropriate Content-Type header
    return NextResponse.json(result.data)
  }

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 200))

  const rows = generateFinancialExportRows()

  return NextResponse.json({
    data: rows,
    meta: {
      totalRows: rows.length,
      generatedAt: new Date().toISOString(),
      percentageFormat: 'decimal (0.00-1.00)',
    },
  })
}
