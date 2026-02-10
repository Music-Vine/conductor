'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Asset } from '@/types/asset'
import type { WorkflowHistoryItem } from '@/types/workflow'
import { isMusicAsset } from '@/types/asset'
import { getWorkflowHistory } from '@/lib/api/assets'
import { WorkflowTimeline, ApprovalForm } from '@/components/workflow'

interface WorkflowTabProps {
  asset: Asset
}

export function WorkflowTab({ asset }: WorkflowTabProps) {
  const router = useRouter()
  const [history, setHistory] = useState<WorkflowHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getWorkflowHistory(asset.id)
        setHistory(data)
      } catch (error) {
        console.error('Failed to load workflow history:', error)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [asset.id])

  const handleActionComplete = () => {
    // Refresh the page to show updated state
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Approval Progress</h2>
        {loading ? (
          <div className="text-gray-500">Loading history...</div>
        ) : (
          <WorkflowTimeline
            currentState={asset.status}
            isMusic={isMusicAsset(asset)}
            history={history}
          />
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Review Actions</h2>
        <ApprovalForm asset={asset} onActionComplete={handleActionComplete} />
      </div>
    </div>
  )
}
