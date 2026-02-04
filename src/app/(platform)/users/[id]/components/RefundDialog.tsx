'use client'

import { useState } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@music-vine/cadence'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

interface RefundDialogProps {
  userId: string
  disabled?: boolean
}

/**
 * Refund dialog with confirmation for processing user refunds.
 * Triggers backend endpoint which handles Stripe payment processing.
 */
export function RefundDialog({ userId, disabled = false }: RefundDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{
        success: boolean
        message: string
        refundId: string
      }>(`/api/users/${userId}/refund`)
      return response
    },
    onSuccess: () => {
      toast.success('Refund initiated successfully')
      setOpen(false)
      // Invalidate user queries to refresh subscription data
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process refund')
    },
  })

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <Button
          variant="error"
          disabled={disabled || refundMutation.isPending}
        >
          Issue Refund
        </Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg border border-gray-200 bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <AlertDialog.Title className="text-lg font-semibold text-gray-900">
            Issue Refund?
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 space-y-3 text-sm text-gray-600">
            <p>
              This will initiate a refund for the user&apos;s most recent
              payment. The backend will process this through Stripe.
            </p>
            <p className="font-medium">
              Note: Refunds may take 5-10 business days to appear on the
              user&apos;s statement.
            </p>
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button
                variant="transparent"
                disabled={refundMutation.isPending}
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant="error"
                onClick={(e) => {
                  e.preventDefault()
                  refundMutation.mutate()
                }}
                disabled={refundMutation.isPending}
              >
                {refundMutation.isPending ? 'Processing...' : 'Process Refund'}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
