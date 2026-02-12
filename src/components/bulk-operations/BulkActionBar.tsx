'use client'

import { Button } from '@music-vine/cadence'

export interface BulkActionBarProps {
  selectedCount: number
  entityType: 'asset' | 'user'
  onClearSelection: () => void
  isOperationRunning?: boolean

  // Asset actions (shown when entityType === 'asset')
  onApprove?: () => void
  onReject?: () => void
  onDelete?: () => void
  onArchive?: () => void
  onTakedown?: () => void
  onAddTag?: () => void
  onRemoveTag?: () => void
  onAddToCollection?: () => void
  onRemoveFromCollection?: () => void
  onSetPlatform?: () => void

  // User actions (shown when entityType === 'user')
  onSuspend?: () => void
  onUnsuspend?: () => void
  onDeleteUsers?: () => void
}

export function BulkActionBar({
  selectedCount,
  entityType,
  onClearSelection,
  isOperationRunning = false,
  // Asset actions
  onApprove,
  onReject,
  onDelete,
  onArchive,
  onTakedown,
  onAddTag,
  onAddToCollection,
  onSetPlatform,
  // User actions
  onSuspend,
  onUnsuspend,
  onDeleteUsers,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Left side: selection info */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-900">
            {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
          </span>
          <Button
            variant="subtle"
            size="sm"
            onClick={onClearSelection}
            disabled={isOperationRunning}
          >
            Clear selection
          </Button>
        </div>

        {/* Right side: action buttons */}
        <div className="flex items-center gap-2">
          {entityType === 'asset' && (
            <>
              {onApprove && (
                <Button variant="bold" size="sm" onClick={onApprove} disabled={isOperationRunning}>
                  Approve
                </Button>
              )}
              {onReject && (
                <Button variant="subtle" size="sm" onClick={onReject} disabled={isOperationRunning}>
                  Reject
                </Button>
              )}
              {onAddTag && (
                <Button variant="subtle" size="sm" onClick={onAddTag} disabled={isOperationRunning}>
                  Add Tag
                </Button>
              )}
              {onAddToCollection && (
                <Button variant="subtle" size="sm" onClick={onAddToCollection} disabled={isOperationRunning}>
                  Add to Collection
                </Button>
              )}
              {onSetPlatform && (
                <Button variant="subtle" size="sm" onClick={onSetPlatform} disabled={isOperationRunning}>
                  Set Platform
                </Button>
              )}
              {onArchive && (
                <Button variant="subtle" size="sm" onClick={onArchive} disabled={isOperationRunning}>
                  Archive
                </Button>
              )}
              {onTakedown && (
                <Button variant="error" size="sm" onClick={onTakedown} disabled={isOperationRunning}>
                  Takedown
                </Button>
              )}
              {onDelete && (
                <Button variant="error" size="sm" onClick={onDelete} disabled={isOperationRunning}>
                  Delete
                </Button>
              )}
            </>
          )}

          {entityType === 'user' && (
            <>
              {onSuspend && (
                <Button variant="subtle" size="sm" onClick={onSuspend} disabled={isOperationRunning}>
                  Suspend
                </Button>
              )}
              {onUnsuspend && (
                <Button variant="subtle" size="sm" onClick={onUnsuspend} disabled={isOperationRunning}>
                  Unsuspend
                </Button>
              )}
              {onDeleteUsers && (
                <Button variant="error" size="sm" onClick={onDeleteUsers} disabled={isOperationRunning}>
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
