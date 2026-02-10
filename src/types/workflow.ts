/**
 * Workflow state for music assets (multi-stage approval process).
 */
export type MusicWorkflowState =
  | 'draft'
  | 'submitted'
  | 'initial_review'
  | 'quality_check'
  | 'platform_assignment'
  | 'final_approval'
  | 'published'
  | 'rejected_initial'
  | 'rejected_quality'
  | 'rejected_final'

/**
 * Workflow state for simple assets (single-stage approval process).
 * Used for SFX, motion graphics, LUTs, and stock footage.
 */
export type SimpleWorkflowState =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'published'
  | 'rejected'

/**
 * Workflow action types that can be performed on assets.
 */
export type WorkflowActionType =
  | 'approve'
  | 'reject'
  | 'request_changes'
  | 'submit'
  | 'unpublish'
  | 'fix_metadata'
  | 'assign_platform'

/**
 * Checklist item for reviewer feedback.
 */
export interface ChecklistItem {
  item: string
  checked: boolean
}

/**
 * Workflow history record documenting state transitions.
 */
export interface WorkflowHistoryItem {
  id: string
  assetId: string
  reviewerId: string
  reviewerName: string
  action: WorkflowActionType
  fromState: MusicWorkflowState | SimpleWorkflowState
  toState: MusicWorkflowState | SimpleWorkflowState
  checklist?: ChecklistItem[]
  comments?: string
  createdAt: string
}
