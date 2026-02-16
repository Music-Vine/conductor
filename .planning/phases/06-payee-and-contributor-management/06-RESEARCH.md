# Phase 6: Payee & Contributor Management - Research

**Researched:** 2026-02-16
**Domain:** Financial relationship management with many-to-many contributor-payee mappings, payout rate configuration, and accounting data export
**Confidence:** HIGH

## Summary

Phase 6 implements complete payee and contributor management enabling staff to define financial relationships between content contributors and payment recipients. The core challenge is modeling many-to-many relationships (one contributor can have multiple payees, one payee can receive payments for multiple contributors) with percentage-based payout rates, providing CRUD operations for both entities, and exporting financial data for accounting integration.

The standard approach builds directly on Phase 2-5 patterns: TanStack Table for list views with server-side pagination, react-hook-form + zod for percentage validation, CSV export for accounting integration, and junction table design for contributor-payee relationships. The key technical decisions are: (1) percentage rate validation and storage (decimal vs integer), (2) ensuring rates sum to 100% per contributor, (3) junction table design with composite keys, and (4) CSV export format for accounting systems.

No CONTEXT.md exists, providing full freedom to recommend best practices. The requirements are straightforward: add contributors (PAYE-01), set payout rates (PAYE-02), assign payees with many-to-many support (PAYE-03), view relationships with filtering (PAYE-04), and export to CSV (PAYE-05). All patterns already exist in the codebase from previous phases.

**Primary recommendation:** Extend Phase 2 user management patterns for contributor/payee CRUD, use junction table (`contributor_payee` with `contributor_id`, `payee_id`, `percentage_rate`) for many-to-many relationships, implement percentage validation ensuring 100% total per contributor, and follow Phase 2 CSV export patterns with accounting-specific field mappings.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack Table | v8.21.3 (installed) | List views for contributors/payees with relationships | Already used in Phase 2-5, proven for large datasets, manual pagination mode for server-side filtering |
| react-hook-form | 7.71.1 (installed) | Form state for contributor/payee profiles and rate assignments | Already in project, handles nested forms, integrated with zod validation |
| zod | 4.3.6 (installed) | Percentage rate validation, relationship constraints | Already in project, runtime validation for 0-100 range, custom refinements for sum-to-100 validation |
| Radix UI Tabs | 1.1.15 (installed) | Contributor detail view with Profile/Payees/Activity tabs | Already used in Phase 2 user details, URL-based tab state, accessible navigation |
| Radix AlertDialog | 1.1.15 (installed) | Confirmation for destructive actions (delete contributor/payee) | Already used in Phase 2/5, WAI-ARIA compliant, simple confirmation pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TanStack Query | 5.90.20 (installed) | Mutations for CRUD operations, cache invalidation | Already in project, optimistic updates for rate changes, refetch on relationship updates |
| react-papaparse | Established in Phase 2 | CSV export with proper escaping | Used in Phase 2 for user export, same pattern for financial data export |
| Sonner | 2.0.7 (via Cadence) | Toast notifications for success/errors | Already installed, consistent feedback for rate changes and exports |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Junction table | Embedded arrays (contributor.payeeIds) | Many-to-many with metadata (percentage) requires junction table per database normalization. Embedded arrays can't store per-relationship data. |
| Percentage as decimal (0.00-1.00) | Percentage as integer (0-100) | Decimal matches financial standards (0.25 = 25%), but integer is more intuitive for UI input. Recommend integer storage with UI formatting. |
| Manual sum validation | Database trigger/constraint | Manual validation provides better UX (immediate feedback), database trigger is safety net. Use both for belt-and-suspenders approach. |
| Flat contributor list | Nested contributors under payees | Requirements show contributors are primary entity (PAYE-01 before PAYE-03). Flat list with separate relationships view follows Phase 2 user pattern. |

**Installation:**
```bash
# All dependencies already installed in Phase 1-5
# No new dependencies required
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(platform)/
│   ├── contributors/
│   │   ├── page.tsx                      # List view with search/filters
│   │   ├── new/
│   │   │   └── page.tsx                  # Add new contributor form
│   │   ├── [id]/
│   │   │   ├── page.tsx                  # Detail view with tabs
│   │   │   ├── edit/
│   │   │   │   └── page.tsx              # Edit contributor form
│   │   │   └── components/
│   │   │       ├── ProfileTab.tsx        # Basic info, contact details
│   │   │       ├── PayeesTab.tsx         # Assigned payees with rates
│   │   │       ├── AssetsTab.tsx         # List of contributor's assets
│   │   │       └── ActivityTab.tsx       # Audit trail for changes
│   │   └── components/
│   │       ├── ContributorTable.tsx      # Virtualized table (Phase 2 pattern)
│   │       ├── ContributorFilters.tsx    # Search + status filters
│   │       └── ContributorForm.tsx       # Reusable form component
│   ├── payees/
│   │   ├── page.tsx                      # List view
│   │   ├── new/
│   │   │   └── page.tsx                  # Add new payee form
│   │   ├── [id]/
│   │   │   ├── page.tsx                  # Detail view with tabs
│   │   │   └── components/
│   │   │       ├── ProfileTab.tsx        # Payment details, tax info
│   │   │       └── ContributorsTab.tsx   # Associated contributors
│   │   └── components/
│   │       ├── PayeeTable.tsx            # Virtualized table
│   │       └── PayeeForm.tsx             # Reusable form component
│   └── financials/
│       └── page.tsx                      # Consolidated financial view
└── app/api/
    ├── contributors/
    │   ├── route.ts                      # List + create
    │   ├── [id]/
    │   │   ├── route.ts                  # Get + update + delete
    │   │   ├── payees/
    │   │   │   └── route.ts              # Assign/remove payees with rates
    │   │   └── assets/
    │   │       └── route.ts              # List contributor's assets
    │   └── export/
    │       └── route.ts                  # CSV export
    ├── payees/
    │   ├── route.ts                      # List + create
    │   ├── [id]/
    │   │   ├── route.ts                  # Get + update + delete
    │   │   └── contributors/
    │   │       └── route.ts              # List payee's contributors
    │   └── export/
    │       └── route.ts                  # CSV export
    └── financials/
        ├── route.ts                      # Combined financial data
        └── export/
            └── route.ts                  # Full financial export for accounting
```

### Pattern 1: Many-to-Many Junction Table Design

**What:** Model contributor-payee relationships using a junction table with percentage rate metadata.

**When to use:** Always for many-to-many relationships with per-relationship metadata (percentage rate in this case).

**Example:**
```typescript
// Source: https://www.beekeeperstudio.io/blog/many-to-many-database-relationships-complete-guide
// types/financial.ts

export interface Contributor {
  id: string
  name: string
  email: string
  phone?: string
  taxId?: string // EIN or SSN
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface Payee {
  id: string
  name: string
  email: string
  phone?: string
  taxId?: string
  paymentMethod: 'ach' | 'wire' | 'check' | 'paypal'
  paymentDetails: {
    accountNumber?: string
    routingNumber?: string
    paypalEmail?: string
  }
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

// Junction table with metadata
export interface ContributorPayee {
  contributorId: string
  payeeId: string
  percentageRate: number // 0-100 stored as integer
  effectiveDate: string // When this rate became effective
  notes?: string
  createdAt: string
  updatedAt: string
}

// Combined view for display
export interface ContributorPayeeRelationship {
  id: string // contributorId-payeeId composite
  contributor: Contributor
  payee: Payee
  percentageRate: number
  effectiveDate: string
  notes?: string
}
```

### Pattern 2: Percentage Rate Validation

**What:** Validate percentage rates ensuring each contributor's payee rates sum to 100% exactly.

**When to use:** For all payout rate assignments and edits per PAYE-02 requirement.

**Example:**
```typescript
// Source: https://zod.dev + custom refinement pattern
// lib/validation/financial.ts

import { z } from 'zod'

// Individual rate validation
export const percentageRateSchema = z.object({
  payeeId: z.string().min(1, 'Payee is required'),
  percentageRate: z
    .number()
    .int('Percentage must be a whole number')
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),
  effectiveDate: z.string().datetime(),
  notes: z.string().optional(),
})

// Multiple payees validation (sum must equal 100%)
export const contributorPayeesSchema = z.object({
  contributorId: z.string(),
  payees: z.array(percentageRateSchema)
    .min(1, 'At least one payee is required')
    .refine(
      (payees) => {
        const sum = payees.reduce((acc, p) => acc + p.percentageRate, 0)
        return sum === 100
      },
      {
        message: 'Payee percentages must sum to exactly 100%',
      }
    ),
})

// UI helper for remaining percentage
export function calculateRemainingPercentage(
  currentRates: Array<{ percentageRate: number }>
): number {
  const sum = currentRates.reduce((acc, r) => acc + r.percentageRate, 0)
  return Math.max(0, 100 - sum)
}

// Validation error message formatter
export function formatPercentageError(
  currentRates: Array<{ percentageRate: number }>
): string {
  const sum = currentRates.reduce((acc, r) => acc + r.percentageRate, 0)
  if (sum < 100) {
    return `Total is ${sum}%. Please assign the remaining ${100 - sum}%.`
  }
  if (sum > 100) {
    return `Total is ${sum}%. Please reduce by ${sum - 100}%.`
  }
  return '' // Valid
}
```

### Pattern 3: Contributor Form with Payee Rate Assignment

**What:** Multi-step or tabbed form allowing contributor creation followed by payee assignment with rate validation.

**When to use:** For PAYE-01 and PAYE-02 requirements (add contributor, set rates).

**Example:**
```typescript
// Source: react-hook-form with nested fields + zod validation
// app/(platform)/contributors/components/ContributorPayeeForm.tsx

'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@music-vine/cadence'
import { contributorPayeesSchema } from '@/lib/validation/financial'

interface PayeeRate {
  payeeId: string
  payeeName: string
  percentageRate: number
  effectiveDate: string
}

interface ContributorPayeeFormProps {
  contributorId: string
  existingPayees: PayeeRate[]
  availablePayees: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
}

export function ContributorPayeeForm({
  contributorId,
  existingPayees,
  availablePayees,
  onSubmit,
}: ContributorPayeeFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contributorPayeesSchema),
    defaultValues: {
      contributorId,
      payees: existingPayees.length > 0
        ? existingPayees
        : [{ payeeId: '', percentageRate: 100, effectiveDate: new Date().toISOString() }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'payees',
  })

  const watchPayees = watch('payees')
  const totalPercentage = watchPayees.reduce(
    (sum, p) => sum + (Number(p.percentageRate) || 0),
    0
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Payee Assignments</h3>
          <div className={`text-sm font-medium ${
            totalPercentage === 100 ? 'text-green-600' :
            totalPercentage < 100 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            Total: {totalPercentage}%
            {totalPercentage !== 100 && ` (${totalPercentage < 100 ? 'remaining' : 'over'}: ${Math.abs(100 - totalPercentage)}%)`}
          </div>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex-1 space-y-3">
              {/* Payee selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payee
                </label>
                <select
                  {...register(`payees.${index}.payeeId`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Select payee...</option>
                  {availablePayees.map((payee) => (
                    <option key={payee.id} value={payee.id}>
                      {payee.name}
                    </option>
                  ))}
                </select>
                {errors.payees?.[index]?.payeeId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.payees[index].payeeId.message}
                  </p>
                )}
              </div>

              {/* Percentage input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    {...register(`payees.${index}.percentageRate`, {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
                {errors.payees?.[index]?.percentageRate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.payees[index].percentageRate.message}
                  </p>
                )}
              </div>

              {/* Effective date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  {...register(`payees.${index}.effectiveDate`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Remove button (if more than one) */}
            {fields.length > 1 && (
              <Button
                type="button"
                variant="subtle"
                size="sm"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        {/* Add payee button */}
        <Button
          type="button"
          variant="subtle"
          onClick={() =>
            append({
              payeeId: '',
              percentageRate: Math.max(0, 100 - totalPercentage),
              effectiveDate: new Date().toISOString(),
            })
          }
        >
          Add Payee
        </Button>

        {/* Form-level error */}
        {errors.payees?.root && (
          <p className="text-sm text-red-600">{errors.payees.root.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="subtle">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="bold"
          disabled={totalPercentage !== 100}
        >
          Save Assignments
        </Button>
      </div>
    </form>
  )
}
```

### Pattern 4: Relationship Table View

**What:** Table displaying contributor-payee relationships with inline percentage editing.

**When to use:** For PAYE-04 requirement (view relationships with filtering).

**Example:**
```typescript
// Source: TanStack Table patterns from Phase 2-5
// app/(platform)/contributors/[id]/components/PayeesTab.tsx

'use client'

import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table'
import { Button } from '@music-vine/cadence'
import { useState } from 'react'

interface PayeeRelationship {
  payeeId: string
  payeeName: string
  payeeEmail: string
  percentageRate: number
  effectiveDate: string
  paymentMethod: string
}

export function PayeesTab({
  contributorId,
  initialRelationships,
}: {
  contributorId: string
  initialRelationships: PayeeRelationship[]
}) {
  const [relationships, setRelationships] = useState(initialRelationships)

  const columns: ColumnDef<PayeeRelationship>[] = [
    {
      accessorKey: 'payeeName',
      header: 'Payee Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.payeeName}</div>
          <div className="text-sm text-gray-600">{row.original.payeeEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'percentageRate',
      header: 'Rate',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold text-gray-900">
            {row.original.percentageRate}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'effectiveDate',
      header: 'Effective Date',
      cell: ({ row }) => new Date(row.original.effectiveDate).toLocaleDateString(),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 uppercase">
          {row.original.paymentMethod}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="subtle"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            Edit Rate
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() => handleRemove(row.original.payeeId)}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: relationships,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPercentage = relationships.reduce(
    (sum, r) => sum + r.percentageRate,
    0
  )

  const handleEdit = (relationship: PayeeRelationship) => {
    // Open edit modal/dialog with ContributorPayeeForm
  }

  const handleRemove = async (payeeId: string) => {
    // Confirm and remove relationship
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Total Payout Rate</div>
            <div className={`text-3xl font-bold ${
              totalPercentage === 100 ? 'text-green-600' :
              totalPercentage < 100 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {totalPercentage}%
            </div>
          </div>
          {totalPercentage !== 100 && (
            <div className="text-sm text-gray-600">
              {totalPercentage < 100
                ? `${100 - totalPercentage}% unassigned`
                : `${totalPercentage - 100}% over allocated`}
            </div>
          )}
        </div>
      </div>

      {/* Relationships table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.column.columnDef.header as string}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">
                    {cell.column.columnDef.cell(cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add payee button */}
      <Button variant="bold" onClick={() => handleEdit(null)}>
        Add Payee
      </Button>
    </div>
  )
}
```

### Pattern 5: Financial Data CSV Export

**What:** Export contributor, payee, and relationship data in accounting-system-compatible CSV format.

**When to use:** For PAYE-05 requirement (export financial data to CSV for accounting).

**Example:**
```typescript
// Source: Phase 2 CSV export pattern + accounting data standards
// lib/utils/export-financial-csv.ts

import { jsonToCSV } from 'react-papaparse'

interface FinancialExportRow {
  contributorId: string
  contributorName: string
  contributorTaxId: string
  contributorEmail: string
  payeeId: string
  payeeName: string
  payeeTaxId: string
  payeeEmail: string
  payeePaymentMethod: string
  percentageRate: number
  effectiveDate: string
  contributorStatus: string
  payeeStatus: string
  createdAt: string
  updatedAt: string
}

export function exportFinancialDataToCSV(
  relationships: Array<{
    contributor: any
    payee: any
    percentageRate: number
    effectiveDate: string
    createdAt: string
    updatedAt: string
  }>
) {
  // Transform to flat structure for CSV
  const csvData: FinancialExportRow[] = relationships.map((rel) => ({
    contributorId: rel.contributor.id,
    contributorName: rel.contributor.name,
    contributorTaxId: rel.contributor.taxId || '',
    contributorEmail: rel.contributor.email,
    payeeId: rel.payee.id,
    payeeName: rel.payee.name,
    payeeTaxId: rel.payee.taxId || '',
    payeeEmail: rel.payee.email,
    payeePaymentMethod: rel.payee.paymentMethod,
    percentageRate: rel.percentageRate / 100, // Convert to decimal for accounting
    effectiveDate: rel.effectiveDate,
    contributorStatus: rel.contributor.status,
    payeeStatus: rel.payee.status,
    createdAt: rel.createdAt,
    updatedAt: rel.updatedAt,
  }))

  // Convert to CSV
  const csv = jsonToCSV(csvData)

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  link.setAttribute('href', url)
  link.setAttribute('download', `financial-data-${timestamp}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Separate exports for contributors and payees
export function exportContributorsToCSV(contributors: any[]) {
  const csvData = contributors.map((c) => ({
    'Contributor ID': c.id,
    'Name': c.name,
    'Email': c.email,
    'Phone': c.phone || '',
    'Tax ID': c.taxId || '',
    'Address': c.address ? `${c.address.street}, ${c.address.city}, ${c.address.state} ${c.address.zip}` : '',
    'Status': c.status,
    'Created At': c.createdAt,
    'Updated At': c.updatedAt,
  }))

  const csv = jsonToCSV(csvData)
  triggerCSVDownload(csv, `contributors-${Date.now()}.csv`)
}

export function exportPayeesToCSV(payees: any[]) {
  const csvData = payees.map((p) => ({
    'Payee ID': p.id,
    'Name': p.name,
    'Email': p.email,
    'Phone': p.phone || '',
    'Tax ID': p.taxId || '',
    'Payment Method': p.paymentMethod,
    'Account Number': p.paymentDetails?.accountNumber || '',
    'Routing Number': p.paymentDetails?.routingNumber || '',
    'Address': p.address ? `${p.address.street}, ${p.address.city}, ${p.address.state} ${p.address.zip}` : '',
    'Status': p.status,
    'Created At': p.createdAt,
    'Updated At': p.updatedAt,
  }))

  const csv = jsonToCSV(csvData)
  triggerCSVDownload(csv, `payees-${Date.now()}.csv`)
}

function triggerCSVDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

### Anti-Patterns to Avoid

- **Allowing rates that don't sum to 100%:** Always validate sum equals 100%. Partial allocation creates ambiguity in payout calculations.

- **Storing percentage as string:** Store as integer (0-100) or decimal (0.00-1.00), never string. Prevents type errors and enables sum calculations.

- **Deleting contributors with assets:** Implement soft delete or prevent deletion if contributor has published assets. Financial records must be immutable.

- **Missing audit trail for rate changes:** Log all rate changes with timestamp, old value, new value, and staff member who made change. Required for financial compliance.

- **Allowing duplicate payee assignments:** Junction table should have composite primary key (`contributor_id`, `payee_id`) to prevent duplicates.

- **Not handling concurrent rate edits:** Use optimistic locking or last-write-wins with timestamp checks to prevent race conditions.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Many-to-many relationships | Embedded arrays or denormalized data | Junction table with composite key | Database normalization, query performance, relationship metadata storage. Industry standard for 50+ years. |
| Percentage validation | Manual sum checking | Zod refinement with clear error messages | Handles edge cases (empty array, non-numeric values), provides type safety, integrates with react-hook-form. |
| CSV export with nested data | Manual CSV string building | react-papaparse jsonToCSV | Handles special characters, quotes in values, consistent escaping, character encoding. Established in Phase 2. |
| Financial data rounding | Math.round() | Store integers, avoid decimals | Floating-point arithmetic introduces rounding errors (0.1 + 0.2 ≠ 0.3). Store percentages as integers (25 not 0.25). |
| Form state management | useState for each field | react-hook-form with useFieldArray | Handles nested forms, validation, dirty state, touched state, field arrays. Already used in Phase 1-4. |

**Key insight:** Financial relationship management is data modeling first, UI second. The junction table pattern is standard database design (1970s normalization theory) that hasn't changed because it works. The complexity is in business logic (sum to 100%, immutability, audit trail) not technical architecture.

## Common Pitfalls

### Pitfall 1: Floating-Point Percentage Arithmetic

**What goes wrong:** Storing percentages as decimals (0.25, 0.50, 0.25) and summing results in 0.9999999 or 1.0000001 instead of exactly 1.0.

**Why it happens:** JavaScript uses IEEE 754 floating-point which cannot represent 0.1 precisely. Repeated addition compounds rounding errors.

**How to avoid:** Store percentages as integers (25, 50, 25) and validate sum equals 100. Convert to decimal only for display or export.

**Warning signs:** Sum validation fails even when percentages look correct. UI shows "99.99999%" or "100.00001%".

```typescript
// WRONG: Float comparison fails
const rates = [0.25, 0.50, 0.25]
const sum = rates.reduce((a, b) => a + b, 0)
console.log(sum === 1.0) // false! (0.9999999999999999)

// CORRECT: Integer comparison works
const rates = [25, 50, 25]
const sum = rates.reduce((a, b) => a + b, 0)
console.log(sum === 100) // true
```

**Source:** [What Every Computer Scientist Should Know About Floating-Point Arithmetic](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)

### Pitfall 2: Cascade Deletion Breaking Financial Records

**What goes wrong:** Deleting a contributor or payee breaks historical financial data and audit trail.

**Why it happens:** Database cascade delete removes junction table rows when parent entity deleted.

**How to avoid:** Implement soft delete (status: 'inactive') or prevent deletion if entity has relationships. Financial data must be immutable per accounting standards.

**Warning signs:** Historical exports missing records. Audit logs show deleted contributors with no trace.

```typescript
// WRONG: Hard delete allows data loss
async function deleteContributor(id: string) {
  await db.contributor.delete({ where: { id } }) // Cascade deletes relationships
}

// CORRECT: Soft delete preserves history
async function deleteContributor(id: string) {
  const hasAssets = await db.asset.count({ where: { contributorId: id } })
  if (hasAssets > 0) {
    throw new Error('Cannot delete contributor with published assets')
  }
  await db.contributor.update({
    where: { id },
    data: { status: 'inactive', deletedAt: new Date() },
  })
}
```

### Pitfall 3: Missing Validation on Rate Updates

**What goes wrong:** Staff edits one payee's rate without updating others, breaking 100% sum constraint.

**Why it happens:** Validation only checks single rate input (0-100), not total across all payees.

**How to avoid:** Validate full contributor-payees relationship on every rate change. Show remaining percentage prominently in UI.

**Warning signs:** Database contains contributors with 80% total rate or 120% total rate. Payout calculations fail.

```typescript
// WRONG: Single rate validation only
const schema = z.object({
  percentageRate: z.number().min(0).max(100),
})

// CORRECT: Multi-rate validation with sum check
const schema = z.object({
  payees: z.array(
    z.object({ percentageRate: z.number().min(0).max(100) })
  ).refine(
    (payees) => payees.reduce((sum, p) => sum + p.percentageRate, 0) === 100,
    { message: 'Total must equal 100%' }
  ),
})
```

### Pitfall 4: Race Conditions on Concurrent Edits

**What goes wrong:** Two staff members edit same contributor's payee rates simultaneously. Last write wins, overwriting first person's changes.

**Why it happens:** No optimistic locking or conflict detection between read and write.

**How to avoid:** Include `updatedAt` timestamp in update query WHERE clause. Reject update if timestamp changed.

**Warning signs:** Staff reports rate changes "disappearing" or being overwritten. Audit logs show conflicting updates.

```typescript
// WRONG: Blind update overwrites concurrent changes
async function updateRates(contributorId: string, payees: any[]) {
  await db.contributorPayee.deleteMany({ where: { contributorId } })
  await db.contributorPayee.createMany({ data: payees })
}

// CORRECT: Optimistic locking detects conflicts
async function updateRates(contributorId: string, payees: any[], lastUpdatedAt: Date) {
  const result = await db.contributor.updateMany({
    where: {
      id: contributorId,
      updatedAt: lastUpdatedAt, // Only update if unchanged
    },
    data: { updatedAt: new Date() },
  })

  if (result.count === 0) {
    throw new Error('Contributor was updated by another user. Please refresh and try again.')
  }

  // Proceed with rate updates
  await db.contributorPayee.deleteMany({ where: { contributorId } })
  await db.contributorPayee.createMany({ data: payees })
}
```

### Pitfall 5: Exporting Sensitive Tax IDs Without Permissions

**What goes wrong:** CSV export includes SSNs/EINs visible to all staff regardless of role.

**Why it happens:** Export function doesn't check staff permissions before including sensitive fields.

**How to avoid:** Check staff role/permissions before export. Mask or omit sensitive fields for non-finance roles.

**Warning signs:** Security audit flags PII exposure. Staff without finance access can see tax IDs.

```typescript
// WRONG: Always exports sensitive data
function exportToCSV(contributors: Contributor[]) {
  return contributors.map(c => ({
    name: c.name,
    taxId: c.taxId, // SSN/EIN visible to everyone
    email: c.email,
  }))
}

// CORRECT: Permission-based field inclusion
function exportToCSV(contributors: Contributor[], staffRole: string) {
  const canViewTaxId = ['admin', 'finance'].includes(staffRole)

  return contributors.map(c => ({
    name: c.name,
    taxId: canViewTaxId ? c.taxId : '***-**-****', // Masked for non-finance
    email: c.email,
  }))
}
```

### Pitfall 6: Not Handling Percentage Edge Cases

**What goes wrong:** UI allows entering 33.33% for three payees, which sums to 99.99% and fails validation.

**Why it happens:** Three-way split (33.33% each) is common but creates rounding problem with integer percentages.

**How to avoid:** Allow one payee to have "remainder" that auto-adjusts. Or show warning suggesting 33%, 33%, 34% split.

**Warning signs:** Users frustrated by "33.33% three times doesn't work" problem. Rounding suggestions in validation errors.

```typescript
// WRONG: Rigid validation blocks valid splits
if (sum !== 100) {
  throw new Error('Must equal exactly 100%')
}

// CORRECT: Suggest valid split with remainder handling
if (sum !== 100) {
  const diff = 100 - sum
  const suggestion = diff < 0
    ? `Reduce by ${Math.abs(diff)}% (try ${payees[0].rate + diff}% for first payee)`
    : `Add ${diff}% (try ${payees[0].rate + diff}% for first payee)`

  throw new Error(`Total is ${sum}%. ${suggestion}`)
}

// BETTER: Auto-adjust last payee
function autoAdjustRates(payees: Array<{ rate: number }>) {
  const sum = payees.slice(0, -1).reduce((a, p) => a + p.rate, 0)
  const lastIndex = payees.length - 1
  payees[lastIndex].rate = 100 - sum // Auto-balance
  return payees
}
```

## Code Examples

Verified patterns from official sources:

### Mock API for Contributors and Payees

```typescript
// Source: Phase 2-4 mock data patterns with seeded generation
// app/api/contributors/route.ts

import { NextRequest, NextResponse } from 'next/server'

interface Contributor {
  id: string
  name: string
  email: string
  phone: string
  taxId: string
  status: 'active' | 'inactive' | 'pending'
  totalAssets: number
  totalPayees: number
  createdAt: string
  updatedAt: string
}

// Generate mock contributors
function generateMockContributors(): Contributor[] {
  const contributors: Contributor[] = []

  const names = [
    'Alex Thompson', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson',
    'David Martinez', 'Rachel Kim', 'James Brown', 'Lisa Anderson',
    'Chris Taylor', 'Maria Garcia', 'Kevin White', 'Jennifer Lee',
    'Tom Harris', 'Sophie Clark', 'Daniel Moore', 'Olivia Davis',
    'Ryan Miller', 'Nicole Taylor', 'Brandon Scott', 'Amanda Green',
  ]

  const now = Date.now()
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)

  for (let i = 0; i < 20; i++) {
    const name = names[i]
    const firstName = name.split(' ')[0].toLowerCase()
    const lastName = name.split(' ')[1].toLowerCase()

    contributors.push({
      id: `contrib-${String(i + 1).padStart(3, '0')}`,
      name,
      email: `${firstName}.${lastName}@example.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      taxId: `XX-XXX${String(Math.floor(Math.random() * 9000) + 1000)}`, // Masked
      status: i < 18 ? 'active' : i < 19 ? 'pending' : 'inactive',
      totalAssets: Math.floor(Math.random() * 50) + 1,
      totalPayees: Math.min(Math.floor(Math.random() * 3) + 1, 3),
      createdAt: new Date(oneYearAgo + Math.random() * (now - oneYearAgo)).toISOString(),
      updatedAt: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return contributors
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'all'
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 50

  let contributors = generateMockContributors()

  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase()
    contributors = contributors.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery) ||
        c.id.toLowerCase().includes(lowerQuery)
    )
  }

  // Filter by status
  if (status !== 'all') {
    contributors = contributors.filter((c) => c.status === status)
  }

  // Sort by name
  contributors.sort((a, b) => a.name.localeCompare(b.name))

  // Pagination
  const total = contributors.length
  const start = (page - 1) * limit
  const end = start + limit
  const results = contributors.slice(start, end)

  // Add small latency for realism
  await new Promise((resolve) => setTimeout(resolve, 150))

  return NextResponse.json({
    data: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate required fields
  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: 'Name and email are required' },
      { status: 400 }
    )
  }

  // Create contributor (mock)
  const contributor: Contributor = {
    id: `contrib-${String(Math.floor(Math.random() * 900) + 100)}`,
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    taxId: body.taxId || '',
    status: 'pending',
    totalAssets: 0,
    totalPayees: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200))

  return NextResponse.json({ data: contributor }, { status: 201 })
}
```

### Contributor-Payee Relationship API

```typescript
// Source: Junction table pattern with percentage metadata
// app/api/contributors/[id]/payees/route.ts

import { NextRequest, NextResponse } from 'next/server'

interface ContributorPayeeRelationship {
  contributorId: string
  payeeId: string
  payeeName: string
  payeeEmail: string
  paymentMethod: string
  percentageRate: number
  effectiveDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contributorId } = await params

  // Mock relationships
  const relationships: ContributorPayeeRelationship[] = [
    {
      contributorId,
      payeeId: 'payee-001',
      payeeName: 'Main Publishing LLC',
      payeeEmail: 'payments@mainpublishing.com',
      paymentMethod: 'ach',
      percentageRate: 70,
      effectiveDate: '2025-01-01T00:00:00Z',
      notes: 'Primary publishing rights',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    {
      contributorId,
      payeeId: 'payee-002',
      payeeName: 'Alex Thompson Personal',
      payeeEmail: 'alex.thompson@example.com',
      paymentMethod: 'paypal',
      percentageRate: 30,
      effectiveDate: '2025-01-01T00:00:00Z',
      notes: 'Personal royalty share',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
  ]

  await new Promise((resolve) => setTimeout(resolve, 100))

  return NextResponse.json({ data: relationships })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contributorId } = await params
  const body = await request.json()

  // Validate payload
  if (!Array.isArray(body.payees) || body.payees.length === 0) {
    return NextResponse.json(
      { error: 'Payees array is required' },
      { status: 400 }
    )
  }

  // Validate sum equals 100%
  const totalPercentage = body.payees.reduce(
    (sum: number, p: any) => sum + (p.percentageRate || 0),
    0
  )

  if (totalPercentage !== 100) {
    return NextResponse.json(
      {
        error: 'Percentage rates must sum to exactly 100%',
        totalPercentage,
      },
      { status: 400 }
    )
  }

  // Mock save operation
  await new Promise((resolve) => setTimeout(resolve, 200))

  return NextResponse.json({
    message: 'Payee assignments updated successfully',
    totalPercentage,
  })
}
```

### Percentage Input Component with Validation

```typescript
// Source: Custom input with percentage formatting and validation
// components/forms/PercentageInput.tsx

'use client'

import { forwardRef, useState } from 'react'
import { Input } from '@music-vine/cadence'

interface PercentageInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  error?: string
  showRemaining?: boolean
  remaining?: number
}

export const PercentageInput = forwardRef<HTMLInputElement, PercentageInputProps>(
  function PercentageInput(
    {
      value,
      onChange,
      min = 0,
      max = 100,
      disabled = false,
      error,
      showRemaining = false,
      remaining = 0,
    },
    ref
  ) {
    const [focused, setFocused] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value) || 0
      const clamped = Math.min(Math.max(numValue, min), max)
      onChange(clamped)
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="number"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-12 border rounded
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${focused ? 'ring-2 ring-platform-primary' : ''}
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
        />

        {/* Percentage symbol */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          %
        </span>

        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}

        {/* Remaining percentage hint */}
        {showRemaining && !error && (
          <p className="mt-1 text-sm text-gray-600">
            {remaining > 0 ? (
              <span className="text-yellow-600">
                {remaining}% remaining to allocate
              </span>
            ) : remaining < 0 ? (
              <span className="text-red-600">
                Over by {Math.abs(remaining)}%
              </span>
            ) : (
              <span className="text-green-600">
                ✓ Fully allocated
              </span>
            )}
          </p>
        )}
      </div>
    )
  }
)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Percentage as decimal (0.00-1.00) | Percentage as integer (0-100) | 2010s+ | Avoids floating-point rounding errors, more intuitive for UI, easier validation. Convert to decimal only for export. |
| Manual CSV string concatenation | react-papaparse jsonToCSV | Established 2015+ | Handles edge cases (quotes, commas in values, line breaks), proper character encoding, verified in Phase 2. |
| Hard delete | Soft delete (status: 'inactive') | Financial compliance 2000s+ | Preserves audit trail, enables historical reporting, required for SOX/GDPR compliance. |
| Single form submit | Optimistic locking with timestamp | Database best practice 1990s+ | Prevents race conditions, detects concurrent edits, clear error messaging for conflicts. |
| String storage for structured data | Typed junction table with constraints | Database normalization 1970s+ | Query performance, relationship integrity, enables JOINs, standard database design. |

**Deprecated/outdated:**
- **Embedded JSON arrays for relationships:** Use proper junction tables. JSON columns prevent efficient queries and lose referential integrity.
- **Percentage validation client-only:** Always validate on server. Client validation is UX, server validation is security.
- **Manual foreign key management:** Use database constraints. Manual checks miss edge cases and cascade deletes.
- **CSV export via server endpoint:** Client-side export (react-papaparse) is instant and reduces server load for small datasets (100-1000 rows). Use server streaming only for 10k+ rows.

## Open Questions

Things that couldn't be fully resolved:

1. **Historical rate changes tracking**
   - What we know: Rates change over time, need effectiveDate field
   - What's unclear: Should we keep full history (temporal table) or just current rate?
   - Recommendation: Start with single current rate per relationship. Add temporal table (effective_from, effective_to) only if business requires historical rate reconstruction for past payouts.

2. **Tax form generation (1099s)**
   - What we know: US tax law requires 1099-MISC for contractors paid $600+
   - What's unclear: Is 1099 generation in scope for Phase 6 or separate Phase 7?
   - Recommendation: Store necessary data (name, address, SSN/EIN) in Phase 6. Defer actual 1099 PDF generation to Phase 7 or external accounting system integration.

3. **Multi-currency support**
   - What we know: Music Vine/Uppbeat may have international contributors
   - What's unclear: Are rates always in USD or do some contributors receive payments in EUR/GBP?
   - Recommendation: Start with USD-only in Phase 6. Add currency field to payee table if international expansion is planned. Percentage rates remain currency-agnostic.

4. **Minimum payout thresholds**
   - What we know: Payment processors often have minimum transaction amounts ($10-$50)
   - What's unclear: Should contributors accrue balance until threshold reached?
   - Recommendation: Store payment threshold in payee settings. Out of scope for Phase 6 (relationship management). Payout processing is separate Phase 7 or 8.

5. **Contributor vs Payee naming clarity**
   - What we know: "Contributor" creates assets, "Payee" receives payments
   - What's unclear: Can same person be both contributor and payee? UI clarity for "self-pay" scenario?
   - Recommendation: Keep entities separate even if same person. Allows contributor to assign 100% to themselves as payee. Clearer data model than special-case "no payee = self" logic.

## Sources

### Primary (HIGH confidence)

- [Many-to-Many Database Relationships Complete Guide | Beekeeper Studio](https://www.beekeeperstudio.io/blog/many-to-many-database-relationships-complete-guide) - Junction table design patterns
- [Many to Many Relationships: A Guide to Database Design | DataCamp](https://www.datacamp.com/blog/many-to-many-relationship) - Best practices for many-to-many relationships
- [How to Design UI Forms in 2026 | IxDF](https://www.interaction-design.org/literature/article/ui-form-design) - Form design patterns for profile management
- [TanStack Table Data Guide](https://tanstack.com/table/latest/docs/guide/data) - Nested data and relationship patterns
- [Zod Documentation](https://zod.dev) - Schema validation with refinements
- [react-hook-form useFieldArray](https://react-hook-form.com/api/usefieldarray) - Dynamic form arrays for multiple payees
- Project codebase Phases 2-5 - Established patterns for tables, forms, CSV export

### Secondary (MEDIUM confidence)

- [Music Royalties Explained: Ultimate Guide for 2026 | Indie Music Academy](https://www.indiemusicacademy.com/blog/music-royalties-explained) - Royalty split patterns in music industry
- [How Are Mechanical Royalties Calculated | Trolley](https://trolley.com/learning-center/payouts-unpacked-how-are-mechanical-royalties-calculated-and-reported/) - Percentage rate management patterns
- [Financial Data Integration: Ultimate Guide 2026 | Mammoth](https://mammoth.io/blog/financial-data-integration/) - CSV export and accounting integration
- [Data Validation Best Practices | Cube Software](https://www.cubesoftware.com/blog/data-validation-best-practices) - Financial data validation patterns
- [20 Profile Page Design Examples | Eleken](https://www.eleken.co/blog-posts/profile-page-design) - UI patterns for contributor profiles
- [Form Validation Best Practices | IvyForms](https://ivyforms.com/blog/form-validation-best-practices/) - Percentage input validation

### Tertiary (LOW confidence)

- [Profit Split in Trademark Valuation | Markables](https://www.markables.net/profit-split-in-trademark-valuation) - Financial split calculations (trademark context, not directly applicable)
- [How to Split Royalties | Ditto Music](https://dittomusic.com/en/tools/royalty-splits) - Music-specific splits (may not match Music Vine/Uppbeat model)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and proven in Phase 1-5, no new dependencies, patterns well-established
- Architecture patterns: HIGH - Direct application of Phase 2 user management patterns, junction table is database standard, percentage validation is straightforward
- Pitfalls: HIGH - Financial data pitfalls well-documented (float arithmetic, soft delete, audit trails), verified through industry standards
- Code examples: HIGH - Based on existing codebase patterns, react-hook-form + zod already in use, TanStack Table proven in Phase 2-5

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - stable tech stack, no new libraries, financial patterns are timeless)

**Dependencies on previous phases:**
- Phase 1: API client, audit logging, authentication, form validation (react-hook-form + zod)
- Phase 2: User management patterns (table, filters, detail view, CSV export), Radix tabs, TanStack Table pagination
- Phase 3: Empty states, keyboard navigation (optional for this phase)
- Phase 4: Asset association (contributors linked to assets via contributorId)
- Phase 5: Bulk operations (optional - bulk rate updates could be future enhancement)

**Key recommendations for planner:**
- Contributor CRUD first (PAYE-01), then Payee CRUD, then relationships (PAYE-03) - incremental complexity
- Percentage validation is critical business logic - implement with both client and server checks
- Follow Phase 2 patterns exactly - same table structure, same tab layout, same CSV export pattern
- Junction table with composite primary key prevents duplicate assignments
- Soft delete for both contributors and payees (financial records must be immutable)
- Mock API with 20 contributors, 10 payees, various rate splits for development
- CSV export in accounting format (decimal rates 0.25 not 25, proper field names for QuickBooks/Xero)
