'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AssetTable } from './AssetTable'
import { AssetTablePagination } from './AssetTablePagination'
import { BulkActionBar, BulkConfirmDialog, TypeToConfirmDialog } from '@/components/bulk-operations'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { useBulkProgress } from '@/hooks/useBulkProgress'
import type { AssetListItem } from '@/types/asset'

interface AssetListClientProps {
  initialData: AssetListItem[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

type BulkAction = 'approve' | 'reject' | 'delete' | 'archive' | 'takedown' | 'add-tag' | null
type DestructiveAction = 'delete' | 'archive' | 'takedown'

export function AssetListClient({ initialData, pagination }: AssetListClientProps) {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [currentAction, setCurrentAction] = useState<BulkAction>(null)

  const bulkSelection = useBulkSelection({
    entityType: 'asset',
    filterParams: searchParams,
    totalFilteredCount: pagination.totalItems,
  })

  const bulkProgress = useBulkProgress()

  const isDestructive = (action: BulkAction): action is DestructiveAction => {
    return action === 'delete' || action === 'archive' || action === 'takedown'
  }

  const handleBulkAction = useCallback(async (action: string) => {
    const assetIds = Array.from(bulkSelection.selectedIds)
    const result = await bulkProgress.startOperation('/assets/bulk', {
      action,
      assetIds,
    })

    if (result.success) {
      bulkSelection.clearSelection()
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    }

    setCurrentAction(null)
  }, [bulkSelection, bulkProgress, queryClient])

  const handleConfirm = useCallback(() => {
    if (currentAction) {
      handleBulkAction(currentAction)
    }
  }, [currentAction, handleBulkAction])

  return (
    <>
      <AssetTable
        data={initialData}
        pagination={pagination}
      />

      <AssetTablePagination pagination={pagination} />

      <BulkActionBar
        selectedCount={bulkSelection.selectedCount}
        entityType="asset"
        onClearSelection={bulkSelection.clearSelection}
        isOperationRunning={bulkProgress.isRunning}
        onApprove={() => setCurrentAction('approve')}
        onReject={() => setCurrentAction('reject')}
        onDelete={() => setCurrentAction('delete')}
        onArchive={() => setCurrentAction('archive')}
        onTakedown={() => setCurrentAction('takedown')}
        onAddTag={() => setCurrentAction('add-tag')}
      />

      {/* Simple confirmation for non-destructive actions */}
      {currentAction && !isDestructive(currentAction) && (
        <BulkConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setCurrentAction(null)}
          action={currentAction}
          itemCount={bulkSelection.selectedCount}
          entityType="asset"
          onConfirm={handleConfirm}
          isLoading={bulkProgress.isRunning}
        />
      )}

      {/* Type-to-confirm for destructive actions */}
      {currentAction && isDestructive(currentAction) && (
        <TypeToConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setCurrentAction(null)}
          action={currentAction}
          itemCount={bulkSelection.selectedCount}
          entityType="asset"
          onConfirm={handleConfirm}
          isLoading={bulkProgress.isRunning}
        />
      )}
    </>
  )
}
