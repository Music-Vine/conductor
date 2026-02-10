'use client'

import { useState } from 'react'
import { Button } from '@music-vine/cadence'
import type { Asset } from '@/types/asset'
import type { WorkflowActionType, ChecklistItem } from '@/types/workflow'
import { getAvailableActions, musicTransitions, simpleTransitions } from '@/lib/workflow/transitions'
import { isMusicAsset } from '@/types/asset'
import { approveAsset, rejectAsset } from '@/lib/api/assets'

interface ApprovalFormProps {
  asset: Asset
  onActionComplete: () => void
}

const CHECKLIST_ITEMS: Record<string, string[]> = {
  initial_review: [
    'Audio quality is acceptable',
    'File format is correct',
    'No copyright issues detected',
  ],
  quality_check: [
    'Metadata is accurate',
    'Tags are appropriate',
    'BPM/Key information is correct',
  ],
  platform_assignment: [
    'Platform selection confirmed',
  ],
  final_approval: [
    'All previous checks verified',
    'Ready for publication',
  ],
  review: [
    'Content quality acceptable',
    'Metadata complete',
    'No issues detected',
  ],
}

export function ApprovalForm({ asset, onActionComplete }: ApprovalFormProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const items = CHECKLIST_ITEMS[asset.status] || []
    return items.map(item => ({ item, checked: false }))
  })
  const [comments, setComments] = useState('')
  const [platform, setPlatform] = useState<'music-vine' | 'uppbeat' | 'both'>('both')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const transitions = isMusicAsset(asset) ? musicTransitions : simpleTransitions
  const availableActions = getAvailableActions(asset.status, transitions)

  const canApprove = availableActions.includes('approve')
  const canReject = availableActions.includes('reject')
  const isPlatformAssignment = asset.status === 'platform_assignment'

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      await approveAsset(asset.id, {
        checklist,
        comments: comments || undefined,
        ...(isPlatformAssignment ? { platform } : {}),
      })
      onActionComplete()
    } catch (error) {
      console.error('Approve failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!comments.trim()) {
      alert('Please provide feedback for rejection')
      return
    }
    setIsSubmitting(true)
    try {
      await rejectAsset(asset.id, { checklist, comments })
      onActionComplete()
    } catch (error) {
      console.error('Reject failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleChecklistItem = (index: number) => {
    setChecklist(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    )
  }

  // Show message if not in a reviewable state
  if (!canApprove && !canReject) {
    if (asset.status === 'draft') {
      return (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">This asset has not been submitted for review yet.</p>
        </div>
      )
    }
    if (asset.status === 'published') {
      return (
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <p className="text-green-700">This asset has been published.</p>
        </div>
      )
    }
    return (
      <div className="bg-yellow-50 rounded-lg p-6 text-center">
        <p className="text-yellow-700">No actions available for current state: {asset.status}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Checklist */}
      {checklist.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Review Checklist</h3>
          <div className="space-y-2">
            {checklist.map((item, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecklistItem(index)}
                  className="h-4 w-4 rounded border-gray-300 text-platform-primary focus:ring-platform-primary"
                />
                <span className="text-sm text-gray-700">{item.item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Platform selection for platform_assignment stage */}
      {isPlatformAssignment && isMusicAsset(asset) && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Platform Assignment</h3>
          <div className="flex gap-4">
            {(['music-vine', 'uppbeat', 'both'] as const).map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  value={p}
                  checked={platform === p}
                  onChange={() => setPlatform(p)}
                  className="h-4 w-4 border-gray-300 text-platform-primary focus:ring-platform-primary"
                />
                <span className="text-sm text-gray-700">
                  {p === 'music-vine' ? 'Music Vine Only' :
                   p === 'uppbeat' ? 'Uppbeat Only' :
                   'Both Platforms'}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Comments {canReject && <span className="text-gray-500">(required for rejection)</span>}
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-platform-primary focus:ring-1 focus:ring-platform-primary"
          placeholder="Add feedback or notes..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {canApprove && (
          <Button
            variant="bold"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Approve'}
          </Button>
        )}
        {canReject && (
          <Button
            variant="error"
            onClick={handleReject}
            disabled={isSubmitting || !comments.trim()}
          >
            {isSubmitting ? 'Processing...' : 'Reject'}
          </Button>
        )}
      </div>
    </div>
  )
}
