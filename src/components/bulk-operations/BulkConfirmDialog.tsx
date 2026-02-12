'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button } from '@music-vine/cadence'

interface BulkConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'approve' | 'reject' | 'add-tag' | 'remove-tag' | 'add-to-collection' | 'remove-from-collection' | 'set-platform' | 'suspend' | 'unsuspend'
  itemCount: number
  entityType: 'asset' | 'user'
  onConfirm: () => void
  isLoading?: boolean
  // Optional action-specific content
  children?: React.ReactNode
}

const actionConfig = {
  approve: {
    title: 'Approve',
    description: 'Selected items will be approved and moved to the next workflow stage.',
    buttonVariant: 'bold' as const,
  },
  reject: {
    title: 'Reject',
    description: 'Selected items will be rejected. Contributors will be notified.',
    buttonVariant: 'subtle' as const,
  },
  'add-tag': {
    title: 'Add Tag',
    description: 'The selected tag will be added to all selected items.',
    buttonVariant: 'bold' as const,
  },
  'remove-tag': {
    title: 'Remove Tag',
    description: 'The selected tag will be removed from all selected items.',
    buttonVariant: 'subtle' as const,
  },
  'add-to-collection': {
    title: 'Add to Collection',
    description: 'Selected items will be added to the chosen collection.',
    buttonVariant: 'bold' as const,
  },
  'remove-from-collection': {
    title: 'Remove from Collection',
    description: 'Selected items will be removed from the chosen collection.',
    buttonVariant: 'subtle' as const,
  },
  'set-platform': {
    title: 'Set Platform',
    description: 'Platform assignment will be updated for all selected items.',
    buttonVariant: 'bold' as const,
  },
  suspend: {
    title: 'Suspend',
    description: 'Selected users will be suspended and unable to access their accounts.',
    buttonVariant: 'subtle' as const,
  },
  unsuspend: {
    title: 'Unsuspend',
    description: 'Selected users will be unsuspended and regain access to their accounts.',
    buttonVariant: 'bold' as const,
  },
}

export function BulkConfirmDialog({
  open,
  onOpenChange,
  action,
  itemCount,
  entityType,
  onConfirm,
  isLoading = false,
  children,
}: BulkConfirmDialogProps) {
  const config = actionConfig[action]
  const entityLabel = entityType === 'asset' ? 'asset' : 'user'

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <AlertDialog.Title className="text-lg font-semibold text-gray-900">
            {config.title} {itemCount} {entityLabel}{itemCount === 1 ? '' : 's'}?
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            {config.description}
          </AlertDialog.Description>

          {/* Optional children for action-specific inputs (e.g., tag selector, collection picker) */}
          {children && <div className="mt-4">{children}</div>}

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="subtle" disabled={isLoading}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant={config.buttonVariant}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : config.title}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
