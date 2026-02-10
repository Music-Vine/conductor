/**
 * Test script to validate workflow transitions.
 * Run with: npx tsx src/lib/workflow/__test-transitions.ts
 */

import {
  musicTransitions,
  simpleTransitions,
  getNextState,
  getAvailableActions,
  canTransition,
} from './transitions'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASSED: ${message}`)
}

console.log('Testing Music Workflow Transitions...\n')

// Test draft can submit
assert(
  getNextState('draft', 'submit', musicTransitions) === 'submitted',
  'Draft can submit to submitted'
)

// Test submitted can approve to initial_review
assert(
  getNextState('submitted', 'approve', musicTransitions) === 'initial_review',
  'Submitted can approve to initial_review'
)

// Test initial_review can approve to quality_check
assert(
  getNextState('initial_review', 'approve', musicTransitions) === 'quality_check',
  'Initial_review can approve to quality_check'
)

// Test initial_review can reject
assert(
  getNextState('initial_review', 'reject', musicTransitions) === 'rejected_initial',
  'Initial_review can reject to rejected_initial'
)

// Test quality_check can approve to platform_assignment
assert(
  getNextState('quality_check', 'approve', musicTransitions) === 'platform_assignment',
  'Quality_check can approve to platform_assignment'
)

// Test quality_check can reject
assert(
  getNextState('quality_check', 'reject', musicTransitions) === 'rejected_quality',
  'Quality_check can reject to rejected_quality'
)

// Test platform_assignment can approve to final_approval
assert(
  getNextState('platform_assignment', 'approve', musicTransitions) === 'final_approval',
  'Platform_assignment can approve to final_approval'
)

// Test final_approval can approve to published
assert(
  getNextState('final_approval', 'approve', musicTransitions) === 'published',
  'Final_approval can approve to published'
)

// Test final_approval can reject
assert(
  getNextState('final_approval', 'reject', musicTransitions) === 'rejected_final',
  'Final_approval can reject to rejected_final'
)

// Test published can unpublish
assert(
  getNextState('published', 'unpublish', musicTransitions) === 'draft',
  'Published can unpublish to draft'
)

// Test rejected states can resubmit
assert(
  getNextState('rejected_initial', 'submit', musicTransitions) === 'submitted',
  'Rejected_initial can resubmit'
)
assert(
  getNextState('rejected_quality', 'submit', musicTransitions) === 'submitted',
  'Rejected_quality can resubmit'
)
assert(
  getNextState('rejected_final', 'submit', musicTransitions) === 'submitted',
  'Rejected_final can resubmit'
)

// Test getAvailableActions
const draftActions = getAvailableActions('draft', musicTransitions)
assert(
  draftActions.includes('submit') && draftActions.includes('fix_metadata'),
  'Draft has submit and fix_metadata actions available'
)

const initialReviewActions = getAvailableActions('initial_review', musicTransitions)
assert(
  initialReviewActions.includes('approve') &&
    initialReviewActions.includes('reject') &&
    initialReviewActions.includes('request_changes') &&
    initialReviewActions.includes('fix_metadata'),
  'Initial_review has approve, reject, request_changes, and fix_metadata actions'
)

// Test canTransition
assert(
  canTransition('draft', 'submit', musicTransitions) === true,
  'canTransition returns true for valid transition'
)

assert(
  canTransition('draft', 'approve', musicTransitions) === false,
  'canTransition returns false for invalid transition'
)

console.log('\nTesting Simple Workflow Transitions...\n')

// Test draft can submit
assert(
  getNextState('draft', 'submit', simpleTransitions) === 'submitted',
  'Draft can submit to submitted'
)

// Test submitted can approve to review
assert(
  getNextState('submitted', 'approve', simpleTransitions) === 'review',
  'Submitted can approve to review'
)

// Test review can approve to published
assert(
  getNextState('review', 'approve', simpleTransitions) === 'published',
  'Review can approve to published'
)

// Test review can reject
assert(
  getNextState('review', 'reject', simpleTransitions) === 'rejected',
  'Review can reject to rejected'
)

// Test rejected can resubmit
assert(
  getNextState('rejected', 'submit', simpleTransitions) === 'submitted',
  'Rejected can resubmit'
)

// Test published can unpublish
assert(
  getNextState('published', 'unpublish', simpleTransitions) === 'draft',
  'Published can unpublish to draft'
)

// Test getAvailableActions for simple workflow
const simpleDraftActions = getAvailableActions('draft', simpleTransitions)
assert(
  simpleDraftActions.includes('submit') && simpleDraftActions.includes('fix_metadata'),
  'Simple workflow draft has submit and fix_metadata actions'
)

const reviewActions = getAvailableActions('review', simpleTransitions)
assert(
  reviewActions.includes('approve') &&
    reviewActions.includes('reject') &&
    reviewActions.includes('request_changes') &&
    reviewActions.includes('fix_metadata'),
  'Review has approve, reject, request_changes, and fix_metadata actions'
)

console.log('\n✅ All workflow transition tests passed!')
