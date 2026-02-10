import type {
  MusicWorkflowState,
  SimpleWorkflowState,
  WorkflowActionType,
} from '@/types/workflow'

/**
 * Represents a valid state transition.
 */
export interface StateTransition<S extends string> {
  from: S
  action: WorkflowActionType
  to: S
}

/**
 * Valid transitions for music workflow (multi-stage).
 */
export const musicTransitions: StateTransition<MusicWorkflowState>[] = [
  // Forward progress
  { from: 'draft', action: 'submit', to: 'submitted' },
  { from: 'submitted', action: 'approve', to: 'initial_review' },
  { from: 'initial_review', action: 'approve', to: 'quality_check' },
  { from: 'quality_check', action: 'approve', to: 'platform_assignment' },
  { from: 'platform_assignment', action: 'approve', to: 'final_approval' },
  { from: 'final_approval', action: 'approve', to: 'published' },

  // Rejections
  { from: 'initial_review', action: 'reject', to: 'rejected_initial' },
  { from: 'quality_check', action: 'reject', to: 'rejected_quality' },
  { from: 'final_approval', action: 'reject', to: 'rejected_final' },

  // Resubmissions
  { from: 'rejected_initial', action: 'submit', to: 'submitted' },
  { from: 'rejected_quality', action: 'submit', to: 'submitted' },
  { from: 'rejected_final', action: 'submit', to: 'submitted' },

  // Unpublish
  { from: 'published', action: 'unpublish', to: 'draft' },

  // Metadata fixes (stay in same state)
  { from: 'draft', action: 'fix_metadata', to: 'draft' },
  { from: 'submitted', action: 'fix_metadata', to: 'submitted' },
  { from: 'initial_review', action: 'fix_metadata', to: 'initial_review' },
  { from: 'quality_check', action: 'fix_metadata', to: 'quality_check' },
  { from: 'platform_assignment', action: 'fix_metadata', to: 'platform_assignment' },
  { from: 'final_approval', action: 'fix_metadata', to: 'final_approval' },

  // Request changes (stay in same state)
  { from: 'initial_review', action: 'request_changes', to: 'initial_review' },
  { from: 'quality_check', action: 'request_changes', to: 'quality_check' },
  { from: 'final_approval', action: 'request_changes', to: 'final_approval' },

  // Platform assignment action
  { from: 'platform_assignment', action: 'assign_platform', to: 'platform_assignment' },
]

/**
 * Valid transitions for simple workflow (single-stage).
 */
export const simpleTransitions: StateTransition<SimpleWorkflowState>[] = [
  // Forward progress
  { from: 'draft', action: 'submit', to: 'submitted' },
  { from: 'submitted', action: 'approve', to: 'review' },
  { from: 'review', action: 'approve', to: 'published' },

  // Rejection
  { from: 'review', action: 'reject', to: 'rejected' },

  // Resubmission
  { from: 'rejected', action: 'submit', to: 'submitted' },

  // Unpublish
  { from: 'published', action: 'unpublish', to: 'draft' },

  // Metadata fixes (stay in same state)
  { from: 'draft', action: 'fix_metadata', to: 'draft' },
  { from: 'submitted', action: 'fix_metadata', to: 'submitted' },
  { from: 'review', action: 'fix_metadata', to: 'review' },

  // Request changes (stay in same state)
  { from: 'review', action: 'request_changes', to: 'review' },
]

/**
 * Get the next state after performing an action.
 * Returns undefined if the transition is not valid.
 */
export function getNextState<S extends string>(
  currentState: S,
  action: WorkflowActionType,
  transitions: StateTransition<S>[]
): S | undefined {
  const transition = transitions.find(
    (t) => t.from === currentState && t.action === action
  )

  return transition?.to
}

/**
 * Get all available actions for a given state.
 */
export function getAvailableActions<S extends string>(
  currentState: S,
  transitions: StateTransition<S>[]
): WorkflowActionType[] {
  return transitions
    .filter((t) => t.from === currentState)
    .map((t) => t.action)
    .filter((action, index, self) => self.indexOf(action) === index) // Remove duplicates
}

/**
 * Check if a transition from current state with given action is valid.
 */
export function canTransition<S extends string>(
  currentState: S,
  action: WorkflowActionType,
  transitions: StateTransition<S>[]
): boolean {
  return transitions.some((t) => t.from === currentState && t.action === action)
}
