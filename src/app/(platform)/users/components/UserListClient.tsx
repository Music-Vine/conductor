'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { UserTable } from './UserTable'
import { UserTablePagination } from './UserTablePagination'
import { BulkActionBar, BulkConfirmDialog, TypeToConfirmDialog } from '@/components/bulk-operations'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { useBulkProgress } from '@/hooks/useBulkProgress'
import type { UserListItem } from '@/types/user'

interface UserListClientProps {
  initialData: UserListItem[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

type BulkUserAction = 'suspend' | 'unsuspend' | 'delete' | null

export function UserListClient({ initialData, pagination }: UserListClientProps) {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [currentAction, setCurrentAction] = useState<BulkUserAction>(null)

  const bulkSelection = useBulkSelection({
    entityType: 'user',
    filterParams: searchParams,
    totalFilteredCount: pagination.totalItems,
  })

  const bulkProgress = useBulkProgress()

  const handleBulkAction = useCallback(async (action: string) => {
    const userIds = Array.from(bulkSelection.selectedIds)
    const result = await bulkProgress.startOperation('/users/bulk', {
      action,
      userIds,
    })

    if (result.success) {
      bulkSelection.clearSelection()
      queryClient.invalidateQueries({ queryKey: ['users'] })
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
      <UserTable
        data={initialData}
        pagination={pagination}
      />

      <UserTablePagination pagination={pagination} />

      <BulkActionBar
        selectedCount={bulkSelection.selectedCount}
        entityType="user"
        onClearSelection={bulkSelection.clearSelection}
        isOperationRunning={bulkProgress.isRunning}
        onSuspend={() => setCurrentAction('suspend')}
        onUnsuspend={() => setCurrentAction('unsuspend')}
        onDeleteUsers={() => setCurrentAction('delete')}
      />

      {/* Simple confirmation for suspend/unsuspend */}
      {currentAction && currentAction !== 'delete' && (
        <BulkConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setCurrentAction(null)}
          action={currentAction}
          itemCount={bulkSelection.selectedCount}
          entityType="user"
          onConfirm={handleConfirm}
          isLoading={bulkProgress.isRunning}
        />
      )}

      {/* Type-to-confirm for delete */}
      {currentAction === 'delete' && (
        <TypeToConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setCurrentAction(null)}
          action="delete"
          itemCount={bulkSelection.selectedCount}
          entityType="user"
          onConfirm={handleConfirm}
          isLoading={bulkProgress.isRunning}
        />
      )}
    </>
  )
}
