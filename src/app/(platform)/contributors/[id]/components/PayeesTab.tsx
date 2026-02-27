'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@music-vine/cadence/ui'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ContributorPayee, PaymentMethod, PayeeListItem } from '@/types'
import { EmptyState } from '@/components/empty-states/EmptyState'
import { fetchPayees } from '@/lib/api/payees'
import { saveContributorPayees } from '@/lib/api/contributors'
import { PayeeAssignmentForm } from './PayeeAssignmentForm'
import { HelpTooltip } from '@/components/HelpTooltip'
import { useRouter } from 'next/navigation'

interface PayeesTabProps {
  contributorId: string
  payees: ContributorPayee[]
}

/**
 * Payment method display labels.
 */
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ach: 'ACH',
  wire: 'Wire',
  check: 'Check',
  paypal: 'PayPal',
}

const columnHelper = createColumnHelper<ContributorPayee>()

/**
 * Payees tab displaying assigned payees with percentage rates.
 * Shows a summary card with total allocation and color-coded status.
 * Integrated with PayeeAssignmentForm for editing assignments.
 * Remove payee uses AlertDialog for confirmation.
 */
export function PayeesTab({ contributorId, payees: initialPayees }: PayeesTabProps) {
  const router = useRouter()
  const [payees, setPayees] = useState<ContributorPayee[]>(initialPayees)
  const [availablePayees, setAvailablePayees] = useState<PayeeListItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoadingPayees, setIsLoadingPayees] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ContributorPayee | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Keep local payees in sync if server re-renders with fresh data
  useEffect(() => {
    setPayees(initialPayees)
  }, [initialPayees])

  const totalRate = payees.reduce((sum, p) => sum + p.percentageRate, 0)

  const rateColorClass =
    totalRate === 100
      ? 'text-green-600'
      : totalRate < 100
        ? 'text-yellow-600'
        : 'text-red-600'

  const rateMessage =
    totalRate === 100
      ? 'Fully allocated'
      : totalRate < 100
        ? `${100 - totalRate}% unassigned`
        : `${totalRate - 100}% over allocated`

  /**
   * Load available payees for the assignment form dropdown.
   */
  async function loadAvailablePayees() {
    if (availablePayees.length > 0) return // Already loaded
    setIsLoadingPayees(true)
    try {
      const result = await fetchPayees({ limit: 100 })
      setAvailablePayees(result.data)
    } catch {
      toast.error('Failed to load payees list')
    } finally {
      setIsLoadingPayees(false)
    }
  }

  /**
   * Open the assignment form, loading available payees first.
   */
  async function handleOpenForm() {
    await loadAvailablePayees()
    setShowForm(true)
  }

  /**
   * Close form and refresh data.
   */
  function handleFormSaved() {
    setShowForm(false)
    router.refresh()
  }

  /**
   * Confirm and remove a single payee assignment.
   * Re-saves the remaining payees with adjusted percentages.
   */
  async function handleConfirmRemove() {
    if (!removeTarget) return
    setIsRemoving(true)
    try {
      const remaining = payees.filter(
        (p) => p.payeeId !== removeTarget.payeeId
      )

      if (remaining.length === 0) {
        toast.error('Cannot remove the last payee. A contributor must have at least one payee.')
        return
      }

      await saveContributorPayees(
        contributorId,
        remaining.map((p) => ({
          payeeId: p.payeeId,
          percentageRate: p.percentageRate,
          effectiveDate: p.effectiveDate,
          notes: p.notes,
        }))
      )

      toast.success(`Removed ${removeTarget.payeeName} from payee assignments`)
      setPayees(remaining)
      setRemoveTarget(null)
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to remove payee'
      toast.error(message)
    } finally {
      setIsRemoving(false)
    }
  }

  const columns = [
    columnHelper.accessor('payeeName', {
      header: 'Payee',
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-xs text-gray-500">
            {info.row.original.payeeEmail}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('percentageRate', {
      header: 'Rate',
      cell: (info) => (
        <span className="text-lg font-semibold text-gray-900">
          {info.getValue()}%
        </span>
      ),
    }),
    columnHelper.accessor('effectiveDate', {
      header: 'Effective Date',
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    }),
    columnHelper.accessor('paymentMethod', {
      header: 'Payment Method',
      cell: (info) => {
        const method = info.getValue()
        return (
          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium uppercase text-gray-700">
            {PAYMENT_METHOD_LABELS[method]}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              handleOpenForm()
            }}
          >
            Edit Rate
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() => setRemoveTarget(info.row.original)}
          >
            Remove
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: payees,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (payees.length === 0 && !showForm) {
    return (
      <div className="space-y-4">
        <EmptyState
          type="first-use"
          title="No payees assigned"
          description="This contributor has no payees assigned yet."
          action={{
            label: isLoadingPayees ? 'Loading...' : 'Assign Payee',
            onClick: handleOpenForm,
          }}
        />
        {showForm && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Assign Payees
            </h3>
            <PayeeAssignmentForm
              contributorId={contributorId}
              existingPayees={[]}
              availablePayees={availablePayees}
              onCancel={() => setShowForm(false)}
              onSaved={handleFormSaved}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total payout rate summary card */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              Total Payout Rate
              <HelpTooltip text="Total rates across all payees must equal exactly 100%. Each payee's rate represents their share of the contributor's earnings." />
            </p>
            <p className={`mt-1 text-2xl font-bold ${rateColorClass}`}>
              {totalRate}%
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${rateColorClass}`}>
              {rateMessage}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {payees.length} payee{payees.length !== 1 ? 's' : ''} assigned
            </p>
          </div>
        </div>
      </div>

      {/* Payee assignment form (shown inline when editing) */}
      {showForm ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Edit Payee Assignments
          </h3>
          {isLoadingPayees ? (
            <p className="text-sm text-gray-500">Loading payees...</p>
          ) : (
            <PayeeAssignmentForm
              contributorId={contributorId}
              existingPayees={payees}
              availablePayees={availablePayees}
              onCancel={() => setShowForm(false)}
              onSaved={handleFormSaved}
            />
          )}
        </div>
      ) : (
        <>
          {/* Payees table */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 text-sm text-gray-700"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit assignments button */}
          <div className="flex justify-start">
            <Button
              variant="bold"
              onClick={handleOpenForm}
              disabled={isLoadingPayees}
            >
              {isLoadingPayees ? 'Loading...' : 'Edit Assignments'}
            </Button>
          </div>
        </>
      )}

      {/* Remove payee confirmation dialog */}
      <AlertDialog.Root
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900">
              Remove {removeTarget?.payeeName}?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-600">
              This will remove <strong>{removeTarget?.payeeName}</strong> ({removeTarget?.percentageRate}%) from this contributor&apos;s payee assignments. You will need to re-allocate their percentage to other payees.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="subtle" disabled={isRemoving}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <Button
                variant="error"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove Payee'}
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
