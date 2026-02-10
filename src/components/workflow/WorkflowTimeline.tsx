'use client'

import type { WorkflowHistoryItem, MusicWorkflowState, SimpleWorkflowState } from '@/types/workflow'
import { getStateLabel, MUSIC_WORKFLOW_STATES, SIMPLE_WORKFLOW_STATES, isRejectedState } from '@/lib/workflow/states'

interface TimelineStage {
  state: string
  label: string
  status: 'completed' | 'current' | 'pending' | 'rejected'
  historyItem?: WorkflowHistoryItem
}

interface WorkflowTimelineProps {
  currentState: string
  isMusic: boolean
  history: WorkflowHistoryItem[]
}

export function WorkflowTimeline({ currentState, isMusic, history }: WorkflowTimelineProps) {
  const stages = isMusic ? MUSIC_WORKFLOW_STATES : SIMPLE_WORKFLOW_STATES

  // Build timeline stages with status
  const timelineStages: TimelineStage[] = stages.map((state) => {
    const historyItem = history.find(h => h.toState === state)
    const currentIndex = stages.indexOf(currentState as any)
    const stageIndex = stages.indexOf(state as any)

    let status: TimelineStage['status'] = 'pending'
    if (isRejectedState(currentState)) {
      // Show rejection path
      if (historyItem) {
        status = 'completed'
      }
      if (state === currentState) {
        status = 'rejected'
      }
    } else if (stageIndex < currentIndex) {
      status = 'completed'
    } else if (stageIndex === currentIndex) {
      status = 'current'
    }

    return {
      state,
      label: getStateLabel(state),
      status,
      historyItem,
    }
  })

  return (
    <ol className="relative border-l-2 border-gray-200 ml-4">
      {timelineStages.map((stage, index) => (
        <li key={stage.state} className="mb-8 ml-6 last:mb-0">
          {/* Status indicator */}
          <span className={`
            absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white
            ${stage.status === 'completed' ? 'bg-green-500' : ''}
            ${stage.status === 'current' ? 'bg-blue-500' : ''}
            ${stage.status === 'pending' ? 'bg-gray-300' : ''}
            ${stage.status === 'rejected' ? 'bg-red-500' : ''}
          `}>
            {stage.status === 'completed' && <CheckIcon className="h-4 w-4 text-white" />}
            {stage.status === 'current' && <span className="h-2 w-2 rounded-full bg-white" />}
            {stage.status === 'rejected' && <XIcon className="h-4 w-4 text-white" />}
          </span>

          {/* Content */}
          <div>
            <h3 className={`font-medium ${
              stage.status === 'current' ? 'text-blue-900' :
              stage.status === 'rejected' ? 'text-red-900' :
              stage.status === 'completed' ? 'text-gray-900' :
              'text-gray-500'
            }`}>
              {stage.label}
            </h3>

            {stage.historyItem && (
              <div className="mt-1 text-sm text-gray-600">
                <span>{stage.historyItem.reviewerName}</span>
                <span className="mx-2">•</span>
                <span>{formatRelativeTime(new Date(stage.historyItem.createdAt))}</span>
              </div>
            )}

            {/* Feedback/comments */}
            {stage.historyItem?.comments && (
              <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {stage.historyItem.comments}
              </p>
            )}

            {/* Checklist */}
            {stage.historyItem?.checklist && stage.historyItem.checklist.length > 0 && (
              <ul className="mt-2 space-y-1">
                {stage.historyItem.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {item.checked ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className={item.checked ? 'text-gray-700' : 'text-red-700'}>
                      {item.item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
