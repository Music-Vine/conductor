'use client'

import { useState, useEffect } from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button, Input } from '@music-vine/cadence'

interface TypeToConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'delete' | 'archive' | 'takedown'
  itemCount: number
  entityType: 'asset' | 'user'
  onConfirm: () => void
  isLoading?: boolean
}

const actionConfig = {
  delete: {
    title: 'Delete',
    description: 'This action cannot be undone. All selected items will be permanently removed.',
    confirmText: 'DELETE',
    buttonVariant: 'error' as const,
  },
  archive: {
    title: 'Archive',
    description: 'Archived items will be hidden from active views but can be restored later.',
    confirmText: 'ARCHIVE',
    buttonVariant: 'error' as const,
  },
  takedown: {
    title: 'Takedown',
    description: 'These items will be immediately removed from public access. This action is logged for compliance.',
    confirmText: 'TAKEDOWN',
    buttonVariant: 'error' as const,
  },
}

export function TypeToConfirmDialog({
  open,
  onOpenChange,
  action,
  itemCount,
  entityType,
  onConfirm,
  isLoading = false,
}: TypeToConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const config = actionConfig[action]
  const isValid = confirmText.toUpperCase() === config.confirmText

  // Reset input when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmText('')
    }
  }, [open])

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

          <div className="mt-4">
            <label htmlFor="confirm-input" className="block text-sm font-medium text-gray-700">
              Type <span className="font-mono font-bold text-red-600">{config.confirmText}</span> to confirm
            </label>
            <Input
              id="confirm-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-2"
              placeholder={config.confirmText}
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="subtle" disabled={isLoading}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              variant={config.buttonVariant}
              onClick={() => {
                if (isValid) {
                  onConfirm()
                }
              }}
              disabled={!isValid || isLoading}
            >
              {isLoading ? 'Processing...' : config.title}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
