'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserStatus } from '@/types/user'
import { Button } from '@music-vine/cadence'

interface SuspendUserDialogProps {
  userId: string
  userEmail: string
  currentStatus: UserStatus
  trigger?: React.ReactNode
}

/**
 * Suspend/unsuspend confirmation dialog.
 *
 * Provides simple confirmation for suspend/unsuspend actions.
 * Per CONTEXT.md: "Simple confirmation dialog (not reason-required modals)"
 */
export function SuspendUserDialog({
  userId,
  userEmail,
  currentStatus,
  trigger,
}: SuspendUserDialogProps) {
  const queryClient = useQueryClient()
  const action = currentStatus === 'active' ? 'suspend' : 'unsuspend'

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${userId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to update account status' }))
        throw new Error(error.message || 'Failed to update account status')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success(
        action === 'suspend'
          ? `${userEmail} has been suspended`
          : `${userEmail} has been unsuspended`
      )

      // Invalidate relevant queries to refetch user data
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to ${action} account`)
    },
  })

  const dialogContent = {
    suspend: {
      title: `Suspend ${userEmail}?`,
      description:
        'This user will lose access to their account immediately. They can be unsuspended later.',
      actionLabel: 'Suspend Account',
      actionVariant: 'error' as const,
    },
    unsuspend: {
      title: `Unsuspend ${userEmail}?`,
      description: 'This user will regain access to their account.',
      actionLabel: 'Unsuspend Account',
      actionVariant: 'primary' as const,
    },
  }

  const content = dialogContent[action]

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        {trigger || (
          <Button
            variant={action === 'suspend' ? 'error' : 'primary'}
            className="px-4 py-2"
          >
            {content.actionLabel}
          </Button>
        )}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <AlertDialog.Title className="text-lg font-semibold text-gray-900">
            {content.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            {content.description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" size="medium" disabled={mutation.isPending}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant={content.actionVariant}
                size="medium"
                onClick={(e) => {
                  e.preventDefault()
                  mutation.mutate()
                }}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Processing...' : content.actionLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
