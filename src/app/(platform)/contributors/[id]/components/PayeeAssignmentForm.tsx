'use client'

import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@music-vine/cadence/ui'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { contributorPayeesSchema, type ContributorPayeesFormData } from '@/lib/validation/financial'
import { saveContributorPayees } from '@/lib/api/contributors'
import type { ContributorPayee, PayeeListItem } from '@/types'

interface PayeeAssignmentFormProps {
  contributorId: string
  existingPayees: ContributorPayee[]
  availablePayees: PayeeListItem[]
  onCancel: () => void
  onSaved: () => void
}

/**
 * Dynamic payee assignment form with percentage rate validation.
 * Uses useFieldArray for dynamic payee rows.
 * Real-time percentage tracking with color-coded status.
 * Submit disabled when total !== 100%.
 */
export function PayeeAssignmentForm({
  contributorId,
  existingPayees,
  availablePayees,
  onCancel,
  onSaved,
}: PayeeAssignmentFormProps) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContributorPayeesFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contributorPayeesSchema as any) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      contributorId,
      payees:
        existingPayees.length > 0
          ? existingPayees.map((p) => ({
              payeeId: p.payeeId,
              percentageRate: p.percentageRate,
              effectiveDate: p.effectiveDate.split('T')[0],
              notes: p.notes ?? '',
            }))
          : [{ payeeId: '', percentageRate: 100, effectiveDate: today, notes: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'payees',
  })

  // Watch all payee rates for real-time percentage tracking
  const watchedPayees = useWatch({ control, name: 'payees' })

  const totalPercentage = (watchedPayees ?? []).reduce((sum, p) => {
    const rate = typeof p?.percentageRate === 'number' ? p.percentageRate : 0
    return sum + rate
  }, 0)

  const remaining = 100 - totalPercentage
  const isValid = totalPercentage === 100

  // Collect all payee IDs already selected in other rows (for disabling duplicates)
  function getSelectedPayeeIds(excludeIndex: number): Set<string> {
    const selected = new Set<string>()
    ;(watchedPayees ?? []).forEach((p, i) => {
      if (i !== excludeIndex && p?.payeeId) {
        selected.add(p.payeeId)
      }
    })
    return selected
  }

  function handleAddPayee() {
    const defaultRate = Math.max(0, remaining)
    append({
      payeeId: '',
      percentageRate: defaultRate,
      effectiveDate: today,
      notes: '',
    })
  }

  async function onSubmit(data: ContributorPayeesFormData) {
    try {
      await saveContributorPayees(contributorId, data.payees)
      toast.success('Payee assignments saved')
      router.refresh()
      onSaved()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save payee assignments'
      toast.error(message)
    }
  }

  // Percentage summary color
  const summaryColorClass = isValid
    ? 'text-green-600'
    : totalPercentage < 100
      ? 'text-yellow-600'
      : 'text-red-600'

  const summaryMessage = isValid
    ? 'Fully allocated'
    : totalPercentage < 100
      ? `${remaining}% remaining to allocate`
      : `Over by ${totalPercentage - 100}%`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Hidden contributorId field */}
      <input type="hidden" {...register('contributorId')} />

      {/* Percentage summary */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">Total allocation:</span>
          <span className={`text-lg font-bold ${summaryColorClass}`}>
            {totalPercentage}%
          </span>
        </div>
        <span className={`text-sm font-medium ${summaryColorClass}`}>
          {summaryMessage}
        </span>
      </div>

      {/* Array-level error */}
      {errors.payees?.root?.message && (
        <p className="text-sm text-red-600" role="alert">
          {errors.payees.root.message}
        </p>
      )}

      {/* Payee rows */}
      <div className="space-y-3">
        {fields.map((field, index) => {
          const selectedPayeeIds = getSelectedPayeeIds(index)
          const rowErrors = errors.payees?.[index]

          return (
            <div
              key={field.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Payee selector */}
                <div className="space-y-1 lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Payee *
                  </label>
                  <select
                    {...register(`payees.${index}.payeeId`)}
                    aria-invalid={!!rowErrors?.payeeId}
                    className={`
                      block w-full appearance-none rounded-lg border bg-white px-3 py-2
                      text-sm text-gray-900
                      focus:outline-none focus:ring-2 focus:ring-offset-0
                      ${
                        rowErrors?.payeeId
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500/20'
                      }
                    `}
                  >
                    <option value="">Select payee...</option>
                    {availablePayees.map((payee) => (
                      <option
                        key={payee.id}
                        value={payee.id}
                        disabled={selectedPayeeIds.has(payee.id)}
                      >
                        {payee.name}
                        {selectedPayeeIds.has(payee.id) ? ' (already assigned)' : ''}
                      </option>
                    ))}
                  </select>
                  {rowErrors?.payeeId && (
                    <p className="text-xs text-red-600">{rowErrors.payeeId.message}</p>
                  )}
                </div>

                {/* Percentage rate */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Rate (%) *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      aria-invalid={!!rowErrors?.percentageRate}
                      {...register(`payees.${index}.percentageRate`, {
                        valueAsNumber: true,
                      })}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                      %
                    </span>
                  </div>
                  {rowErrors?.percentageRate && (
                    <p className="text-xs text-red-600">{rowErrors.percentageRate.message}</p>
                  )}
                </div>

                {/* Effective date */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Effective Date *
                  </label>
                  <Input
                    type="date"
                    aria-invalid={!!rowErrors?.effectiveDate}
                    {...register(`payees.${index}.effectiveDate`)}
                  />
                  {rowErrors?.effectiveDate && (
                    <p className="text-xs text-red-600">{rowErrors.effectiveDate.message}</p>
                  )}
                </div>

                {/* Notes + remove button */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Notes
                  </label>
                  <div className="flex items-start gap-2">
                    <Input
                      type="text"
                      placeholder="Optional note"
                      {...register(`payees.${index}.notes`)}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={() => remove(index)}
                        aria-label={`Remove payee row ${index + 1}`}
                        className="mt-0.5 shrink-0"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add payee row button */}
      <div>
        <Button
          type="button"
          variant="subtle"
          size="sm"
          onClick={handleAddPayee}
        >
          + Add Payee
        </Button>
      </div>

      {/* Form actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <Button
          type="button"
          variant="subtle"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="bold"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Assignments'}
        </Button>
      </div>
    </form>
  )
}
