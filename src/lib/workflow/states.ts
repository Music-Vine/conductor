import type { MusicWorkflowState, SimpleWorkflowState } from '@/types/workflow'

/**
 * Ordered list of music workflow states for timeline display.
 */
export const MUSIC_WORKFLOW_STATES: MusicWorkflowState[] = [
  'draft',
  'submitted',
  'initial_review',
  'quality_check',
  'platform_assignment',
  'final_approval',
  'published',
]

/**
 * Ordered list of simple workflow states for timeline display.
 */
export const SIMPLE_WORKFLOW_STATES: SimpleWorkflowState[] = [
  'draft',
  'submitted',
  'review',
  'published',
]

/**
 * Get human-readable label for a workflow state.
 */
export function getStateLabel(state: MusicWorkflowState | SimpleWorkflowState): string {
  const labels: Record<MusicWorkflowState | SimpleWorkflowState, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    initial_review: 'Initial Review',
    quality_check: 'Quality Check',
    platform_assignment: 'Platform Assignment',
    final_approval: 'Final Approval',
    published: 'Published',
    rejected_initial: 'Rejected (Initial Review)',
    rejected_quality: 'Rejected (Quality Check)',
    rejected_final: 'Rejected (Final Approval)',
    review: 'Review',
    rejected: 'Rejected',
  }

  return labels[state]
}

/**
 * Get Tailwind color class for a workflow state.
 */
export function getStateColor(state: MusicWorkflowState | SimpleWorkflowState): string {
  if (isPublishedState(state)) {
    return 'text-green-600'
  }

  if (isRejectedState(state)) {
    return 'text-red-600'
  }

  if (state === 'draft') {
    return 'text-gray-500'
  }

  // All in-progress states
  return 'text-blue-600'
}

/**
 * Check if a state represents a rejected status.
 */
export function isRejectedState(state: MusicWorkflowState | SimpleWorkflowState): boolean {
  return (
    state === 'rejected_initial' ||
    state === 'rejected_quality' ||
    state === 'rejected_final' ||
    state === 'rejected'
  )
}

/**
 * Check if a state represents published status.
 */
export function isPublishedState(state: MusicWorkflowState | SimpleWorkflowState): boolean {
  return state === 'published'
}
